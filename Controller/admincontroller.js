const user = require('../model/user/userModel')
const admin = require('../model/admin/adminModel')
const product =require('../model/admin/prtMgmMdl')
const category =require('../model/admin/categoryMgm')
const order =  require('../model/cart/orderSchema')
const banner = require('../model/admin/banner')
const walletcollection = require('../model/user/wallet')


const login = (req,res)=>{
    if(req.session.admin){
        res.render('admin/admindash')
    }else{
        res.render('admin/adminLogin')
    }
    
}

const loginPost = async(req,res)=>{
    const value = await admin.findOne({})
    if(value.name== req.body.username && value.password== req.body.password){
        // req.session.admin=req.body.username;
        req.session.admin = {
            username: value.name,
            role: value.role
        };
        console.log(req.session)
        res.render('admin/admindash.ejs')
    }else{
        res.render('admin/adminLogin',{error:"INVALID CREDENTAILS"})
    }
    
}

const getRevenueData = async (filter) => {
    try {
        let pipeline = [];

        if (filter === 'monthly') {
            pipeline = [
                {
                    $group: {
                        _id: {
                            year: { $year: '$orderDate' },
                            month: { $month: '$orderDate' }
                        },
                        totalRevenue: { $sum: '$totalPrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: '$_id.month',
                        year: '$_id.year',
                        totalRevenue: 1
                    }
                },
                {
                    $sort: { year: 1, month: 1 }
                }
            ];
        } else if (filter === 'yearly') {
            pipeline = [
                {
                    $group: {
                        _id: { $year: '$orderDate' },
                        totalRevenue: { $sum: '$totalPrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        year: '$_id',
                        totalRevenue: 1
                    }
                },
                {
                    $sort: { year: 1 }
                }
            ];
        } else if (filter === 'weekly') {
            pipeline = [
                {
                    $group: {
                        _id: { $week: '$orderDate' },
                        totalRevenue: { $sum: '$totalPrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        week: '$_id',
                        totalRevenue: 1
                    }
                },
                {
                    $sort: { week: 1 }
                }
            ];
        } else if (filter === 'daily') {
            pipeline = [
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                        totalRevenue: { $sum: '$totalPrice' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        totalRevenue: 1
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ];
        }

        const revenueData = await order.aggregate(pipeline);
        return revenueData;
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        throw error;
    }
};


async function getBestSellingProducts(limit = 10) {
    const result = await order.aggregate([
        { $unwind: "$orderItems" },
        { $group: { _id: "$orderItems.product", totalQuantity: { $sum: "$orderItems.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "prtmgmcolls",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $unwind: "$product"
        },
        {
            $project: {
                _id: "$product._id",
                name: "$product.name",
                imageUrl:"$product.imageUrl",
                totalQuantity: 1
            }
        }
    ]);
    return result;
}

async function getBestSellingCategories(limit = 10) {
    const result = await order.aggregate([
        { $unwind: "$orderItems" },
        { $lookup: { from: "prtmgmcolls", localField: "orderItems.product", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $group: { _id: "$product.category", totalQuantity: { $sum: "$orderItems.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        
        { $limit: limit }
    ]);
    return result;
}

async function getBestSellingBrands(limit = 10) {
    const result = await order.aggregate([
        { $unwind: "$orderItems" },
        { $lookup: { from: "prtmgmcolls", localField: "orderItems.product", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $group: { _id: "$product.brand", totalQuantity: { $sum: "$orderItems.quantity" } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit }
    ]);
    return result;
}







const dashboard = async (req, res) => {
    try {
        if (req.session.admin) {
            // Fetch data for payment method distribution chart
            const paymentMethodData = await order.aggregate([
                { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
            ]);

            // Fetch data for product-wise sales chart
            const productOrderData = await order.aggregate([
                { $unwind: '$orderItems' },
                { 
                    $group: { 
                        _id: '$orderItems.product', 
                        totalOrders: { $sum: 1 } // Count the number of orders for each product
                    } 
                },
                { 
                    $lookup: { 
                        from: 'prtmgmcolls', 
                        localField: '_id', 
                        foreignField: '_id', 
                        as: 'product' 
                    } 
                },
                { $unwind: '$product' },
                { $project: { productName: '$product.name', totalOrders: 1, _id: 0 } }
            ]);

            // Fetch revenue data based on the selected filter
            const filter = req.query.filter || 'daily'; // Default to monthly filter
            const revenueData = await getRevenueData(filter);

            // Fetch data for best-selling products, categories, and brands
            const bestSellingProducts = await getBestSellingProducts();
            const bestSellingCategories = await getBestSellingCategories();
            const bestSellingBrands = await getBestSellingBrands();

            console.log(revenueData)
            // Render the admin dashboard view along with the payment method distribution chart, product-wise order data, revenue line chart, best-selling products, categories, and brands
            res.render('admin/dashboard.ejs', { 
                paymentMethodData, 
                productOrderData, 
                revenueData, 
                bestSellingProducts,
                bestSellingCategories,
                bestSellingBrands
            });
        } else {
            // Render the admin login view if the session is not authenticated
            res.render('admin/adminLogin');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const revenueChart = async (req, res) => {
    try {
        console.log('hooio')
        const filter = req.query.filter;
        const revenueData = await getRevenueData(filter);
        console.log(revenueData)
        res.status(200).json(revenueData);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const   usermgm = async (req, res) => {
    if (req.session.admin) {
        try {
            const searchQuery = req.query.search || '';
            console.log(searchQuery)
            const users = await user.find({ fname: { $regex: searchQuery, $options: 'i' } });
            console.log(users)
            res.render('admin/usermgm', { users });
        } catch (error) {
            console.error(error);
            res.render('admin/adminLogin');
        }
    } else {
        res.render('admin/adminLogin');
    }
};

const userStatus = async (req, res) => {
    try {
        if (req.session.admin) {
            const userid = req.params._id;
            console.log(userid);
            const x = await user.findOne({ _id: userid });
            await user.findByIdAndUpdate({ _id: userid }, { $set: { status: !x.status } }, { new: true });

           
           res.redirect('/admin/usermgm')
        } else {
            res.render('admin/adminLogin');
        }
    } catch (error) {
        // Handle errors here, you can log them or send an appropriate response to the client
        console.error("Error in userStatus function:", error);
        res.status(500).send("Internal Server Error");
    }
};



const productMgm = async(req,res)=>{
    try{
        const searchQuery =req.query.search  || '' ;
        const productMgm = await product.find({name:{ $regex:searchQuery, $options: 'i'}})
        res.render('admin/adminprtMgm',{productMgm,searchQuery})
    }catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } 
    
}    

const addProduct = async (req, res) => {
    try {
        const categorydata = await category.find();
        console.log(categorydata);
        res.render('admin/addProduct.ejs', { categorydata });
    } catch (error) {
        // Handle errors here, you can log them or send an appropriate response to the client
        console.error("Error in addProduct function:", error);
        res.status(500).send("Internal Server Error");
    }
};


const addProductPost = async (req, res) => {
    try {
        const { name, description, price, category, brand, quantity } = req.body;
        const productImg = req.files;

        const savedProduct = await new product({
            name,
            description,
            price,
            category,
            brand,
            quantity,
            imageUrl: productImg.map(image => image.path)
        }).save();

        const productMgm = await product.find({});
        res.render('admin/adminprtMgm.ejs', { productMgm });
    } catch (error) {
        // Handle the error appropriately
        console.error('Error adding product:', error);
        res.status(500).send('Internal Server Error');
    }
};

const productDetailUpdate = async (req, res) => {
    try {
        const prtid = req.params.id;
        const prt = await product.findById(req.params.id);
        const category1 = await category.find();

        // Check if the product with the specified ID exists
        if (!prt) {
            // If no product is found, handle it accordingly (e.g., send a 404 Not Found response)
            return res.status(404).send('Product not found');
        }

        res.render('admin/updateProduct', { prt, category1 });
        console.log(prt);
    } catch (error) {
        // Handle the error appropriately
        console.error('Error updating product:', error);
        
        // Redirect to an error page or display an error message
        res.status(500).send('Internal Server Error');
    }
};

const productDetailDelete = async (req, res) => {
    try {
        const prtid1 = req.params.id;
        console.log(prtid1);

        // Find the current value of isdeleted
        const productToUpdate = await product.findById(req.params.id);
        const currentIsDeletedValue = productToUpdate.isdeleted;

        // Update the document, setting isdeleted to the negation of its current value
        await product.findByIdAndUpdate(req.params.id, { $set: { isdeleted: !currentIsDeletedValue } });

        // Redirect to the product management page after successful update
        res.redirect('/admin/productMgm');
    } catch (error) {
        // Handle the error appropriately
        console.error('Error updating product:', error);
        
        // Redirect to an error page or display an error message
        res.status(500).send('Internal Server Error');
    }
};


 const productDetailUpdatePost = async(req,res) =>{
    const { name, description, price,offer, category, brand, quantity } = req.body;
    const productImg = req.files;
    console.log(productImg)
    const id = req.params.id
    console.log(id)
    try{
        const existingProduct = await product.findById(id);
    const updatedImageUrl = existingProduct.imageUrl.concat(productImg.map((image) => image.path));
    const updatedProduct = await product.findByIdAndUpdate(
        id,
        {
            name,
            description,
            price,
            offer,
            category,
            brand,
            quantity,
            imageUrl: updatedImageUrl
        },
        { new: true } // To return the updated document
    );
    console.log(updatedProduct)
    res.redirect('/admin/productMgm')

}catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error')
}

}


const categoryMgm = async(req,res)=>{
    try{
        const searchQuery =req.query.search  || '' ;
        const categoryMgm = await category.find({name:{ $regex:searchQuery, $options: 'i'}})
        console.log(categoryMgm)
        res.render('admin/categoryMgm.ejs',{categoryMgm:categoryMgm})
    }catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } 
    // res.render('admin/categoryMgm.ejs')
}

const addNewCateg = async(req,res)=>{
    try{
        if(req.session.admin){
            res.render('admin/addNewCateg')
        }
        else{
            res.render('admin/adminLogin')
            
        }
       
    }catch{
        res.status(500).send('Internal Server Error');
    }
  
}

const addNewCategPost = async(req,res)=>{
    try{
        const{Categoryitem,CategoryDescription} = req.body
        console.log(req.body)

        const existingCategory = await category.findOne({name: { $regex: new RegExp("^" + Categoryitem + "$", "i") },});
      
          if (existingCategory) {
            console.log("Category already exists:", category);
            let error = "category already exists"
            return res.render("admin/addNewCateg.ejs",({error}));
        }else{
            const newCateg = await new category({
                name: Categoryitem,
                description: CategoryDescription,
            }).save()
            console.log(newCateg)
            res.redirect('/admin/categoryMgm') 
        }

    
    }catch(error){
        console.error('Error adding new category:', error);

        res.status(500).send('Internal Server Error');
    }
      
}

const categoryEdit = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await category.findOne({ _id: id });

        if (!data) {
            // If no data is found, handle it accordingly (e.g., send a 404 Not Found response)
            return res.status(404).send('Category not found');
        }

        console.log(data);
        res.render('admin/categoryEdit', { data:data });
    } catch (error) {
        // Handle the error appropriately
        console.error('Error fetching category data:', error);
        res.status(500).send('Internal Server Error');
    }
};

const editCategPost = async (req, res) => {
    console.log('hiiiiiii00009090')
    try {
        const { name, description } = req.body;
        const categoryId = req.params.id;
        
        // Check if the category name is unique (case-insensitive)
        const existingCategory = await category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: categoryId } });

        if (existingCategory) {
            // If a category with the same name already exists, handle accordingly (e.g., send an error message)
            return res.status(400).json({ error: 'Category name must be unique.' });
        }
        console.log('opppp')
        // Update the category if it's unique
        const updatedCategory = await category.findByIdAndUpdate(categoryId, { name, description }, { new: true });
        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });

        console.log(updatedCategory)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
const removeCateg = async(req,res) =>{
    try{
        const id = req.params.id
        const catg =  await category.findById(id)
        if(catg.deleted===true){
            await category.findByIdAndUpdate(id,{$set:{deleted:false}})

        }else{
            await category.findByIdAndUpdate(id,{$set:{deleted:true}})

        }
        res.redirect('/admin/categoryMgm')
    }catch(error){
        res.status(500).send('internal server error')
    }

}



const pdptest = (req,res) =>{
    res.render('/productdetailpgtest')
    

}



const imageDelFetch = async (req, res) => {
    try {
        const id = req.params.id;
        const indexToRemove = req.body.index;

        const unsetQuery = { $unset: { [`imageUrl.${indexToRemove}`]: 1 } };
        await product.findByIdAndUpdate(id, unsetQuery);

        await product.findByIdAndUpdate(id, { $pull: { imageUrl: null } });
        
        const updatedProduct = await product.findById(id);
        
        if (updatedProduct) {
            console.log(updatedProduct);
            res.status(200).json({ success: true, message: 'Image deleted successfully', data: updatedProduct });
        } else {
            
            res.status(404).json({ success: false, message: 'Index not found in imageUrl array' });
        }
    } catch (error) {
        
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const orderStatus = async (req, res) => {
    try {
        // Assuming 'order' and 'product' are defined models
        const orderData = await order.find().populate('orderItems.product').populate('customer').sort({orderDate:-1});
        res.render("admin/orderStatus", { orderData });
    } catch (error) {
        console.error("Error fetching order data:", error);
        res.status(500).send("Internal Server Error");
    }
};


const changeStatus = async (req, res) => {
    try {
        const { orderId, orderItemId, newStatus } = req.body;

        const updatedOrder = await order.findOneAndUpdate(
            { _id: orderId, "orderItems._id": orderItemId }, // Find the order with the given orderId and orderItem with the given orderItemId
            {
                $set: { "orderItems.$.status": newStatus }, // Update the status of the matching orderItem
                $push: {
                    "orderItems.$.orderStatusHistory": { // Push the new status to the orderStatusHistory array of the matching orderItem
                        status: newStatus,
                        updatedAt: new Date(),
                    },
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );
        
        if (!updatedOrder) {
            // Handle the case where the order with the specified ID or orderItem with the specified ID was not found
            console.error('Order or orderItem not found');
            // You can send an appropriate response or throw an error
        }
        
        // Send the updated order as a response or handle it as needed
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).send('Internal Server Error');
    }
}


const bannerMgm = async (req, res) => {
    try {
        const data = await banner.find();
        res.render('admin/bannerMgm', { data });
    } catch (error) {
        console.error("Error in banner management:", error);
        res.status(500).send("Internal Server Error");
    }
};


const addNewBanner =(req,res)=>{
    res.render('admin/addbanner')
}

const addNewBannerPost = async (req, res) => {
    try {
        const { name } = req.body;
        const imageUrl = req.files.map(file => file.path); // Assuming req.files contains an array of files

        // Create a new banner object
        const newBanner = new banner({
            name,
            imageUrl,
            isActive: true // Assuming you want the new banner to be active by default
        });

        // Save the new banner to the database
        await newBanner.save();

       res.redirect('/admin/bannerMgm')
    } catch (error) {
        console.error('Error uploading banner:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const bannerStatus = async (req, res) => {
    const id = req.params.id;
    console.log(id)
    try {
        const data = await banner.findById(id);
        if (!data) {
            return res.status(404).json({ message: "Banner not found" });
        }
        data.isActive = !data.isActive; // Toggle the isActive status
        await data.save();
        res.redirect('/admin/bannerMgm')
    } catch (error) {
        console.error("Error updating banner status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const bannerdelete = async (req, res) => {
    try {
        const id = req.params.id;
        const bannerdata = await banner.findByIdAndDelete(id);
        
        if (!bannerdata) {
            return res.status(404).json({ message: "Banner not found" });
        }
        
        console.log("Banner deleted:", bannerdata);
        res.redirect('/admin/bannerMgm')
    } catch (error) {
        console.error("Error deleting banner:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const logout = async (req, res) => {
    // Clear only the admin session data
    delete req.session.admin;
    // Redirect the admin to the login page after logout
    res.redirect('/admin/login');
};


const acceptReturn = async (req, res) => {
    try {
        console.log("accept return3");
        const { orderId, orderItemId } = req.params;
        console.log(orderId,orderItemId);
        const orderDetails = await order.findById(orderId);

        if (!orderDetails) {
            return res.status(404).json({ error: "Order not found" });
        }

        const orderItem = orderDetails.orderItems.find(item => item._id.toString() == orderItemId);
        console.log(orderItem,"😊😊😊😊");

        if (!orderItem) {
            return res.status(404).json({ error: "Order item not found" });
        }
        console.log(orderItem.returnRequested,"orderitem.reterurequestd");
        // Check if the return request has already been approved
        if (orderItem.returnRequested === true) {
            // Mark the order item as returned and approved
            console.log("this is working");
            orderItem.status = 'returned';
            orderItem.rtnApproved = true;
            await orderDetails.save();

            // Calculate the returned quantity
            const returnedQuantity = orderItem.quantity;

            // Update product stock
            const productdata = await product.findById(orderItem.product);
            if (!productdata) { 
                return res.status(404).json({ error: "Product not found" });
            }

            // Adjust stock based on the returned quantity
            productdata.quantity += returnedQuantity;
            await productdata.save();

            // Calculate the amount to return to the wallet
            const amountToReturn = orderItem.price * returnedQuantity;

            // Find the user's wallet
            const wallet = await walletcollection.findOne({ user: orderDetails.customer });
            if (!wallet) {
                return res.status(404).json({ error: "Wallet not found" });
            }

            // Update wallet balance
            wallet.balance += amountToReturn;

            // Add transaction to wallet history
            wallet.transactions.push({
                amount: amountToReturn,
                type: 'deposit',
            });

            // If all products are returned, update order status to "returned"
            if (orderDetails.orderItems.every(item => item.status === 'returned')) {
                orderDetails.orderStatus = 'returned';
            }

            // Save the updated order details (including the modified orderItem)

            return res.status(200).json({ message: "Return request accepted successfully" });
        } else {
            // Return error if the return request has already been approved
            return res.status(400).json({ error: "Return request has already been approved or not requested" });
        }
        
    } catch (error) {
        console.error("Error in acceptReturn:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const orderReturn = async (req, res) => {
    console.log('Fetching orders with return requests');
    try {
        // Find orders where any orderItem has returnRequested set to true
        const orderData = await order.find({
            'orderItems': {
                $elemMatch: { 'returnRequested': true }
            }
        }).populate({
            path: 'orderItems.product',
            model: 'prtmgmcoll' }).sort({orderDate:-1});

        res.render('admin/return',{orderData})
    } catch (error) {
        console.error('Error retrieving orders with return requests:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const rtnRejected = async (req, res) => {
    
    try {
        const { orderId, orderItemId } = req.params;
        const orderDetails = await order.findById(orderId);

        if (!orderDetails) {
            return res.status(404).json({ error: "Order not found" });
        }

        const orderItem = orderDetails.orderItems.find(item => item._id.toString() === orderItemId);

        if (!orderItem) {
            return res.status(404).json({ error: "Order item not found" });
        }

        // Check if the return request has already been approved
        if (orderItem.returnRequested) {
            // Handle rejection logic here
            // For example, mark the return request as rejected
            orderItem.rtnRejected = true;
            orderItem.status = 'return-rejected'
            await orderDetails.save();

            return res.status(200).json({ message: "Return request rejected successfully" });
        } else {
            return res.status(400).json({ error: "Return request has already been rejected or not requested" });
        }
        
    } catch (error) {
        console.error("Error in rejectReturn:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports ={
    login,
    loginPost,
    dashboard,
    usermgm,
    userStatus,
    productMgm,
    addProduct,
    addProductPost,
    productDetailUpdate,
    productDetailDelete,
    productDetailUpdatePost,
    categoryMgm,
    addNewCateg,
    addNewCategPost,
    categoryEdit,
    editCategPost,
    removeCateg,
    pdptest,
    imageDelFetch,
    orderStatus,
    changeStatus,
    bannerMgm,
    addNewBanner,
    addNewBannerPost,
    bannerStatus,
    bannerdelete,
    logout,
    revenueChart,
    acceptReturn,
    rtnRejected,
    orderReturn

}