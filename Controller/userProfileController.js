const user = require('../model/user/userModel')
const address = require('../model/profile/addressModel')
const order = require('../model/cart/orderSchema')
const product =require('../model/admin/prtMgmMdl')
const category = require('../model/admin/categoryMgm')
const PDFDocument = require('pdfkit');
const doc = new PDFDocument;
const Swal = require('sweetalert2')
const bcrypt =require('bcrypt')
const walletcollection = require('../model/user/wallet')
var easyinvoice = require('easyinvoice');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');



const displayAccountDetails = async (req, res) => {
    let session=req.session.user
    if(req.session.user){
        try {
            const categ = await category.find();
            const email = req.session.user;
            const data = await user.findOne({ email });
    
            if (!data) {
                // Handle case where user data is not found
                return res.status(404).send('User not found');
            }
    
            console.log(data);
            res.render('userProfile/displayAccountInfo', { data, categ ,session});
        } catch (error) {
            // Handle any unexpected errors
            console.error('Error retrieving account details:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userLogin')
    }
    
};



const updateAccountDetails = async (req, res) => {
    let session=req.session.user
    if(req.session.user){
        try {
            const categ = await category.find();
            const email = req.session.user;
            const data = await user.findOne({ email });
    
            if (!data) {
                // Handle case where user data is not found
                return res.status(404).send('User not found');
            }
    
            res.render('userProfile/accountDetailsEdit.ejs', { data, categ ,session});
        } catch (error) {
            console.error('Error rendering accountDetailsEdit page:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userlogin')
    }
   
};


const updateAccountDetailsPost = async (req, res) => {
    

    try {
        const { firstName, lastName, email, mobileNumber } = req.body;

        const data = await user.findOneAndUpdate(
            { email: req.session.user },
            { $set: { fname: firstName, lname: lastName, email: email, mobNo: mobileNumber } },
            { new: true }
        );

        if (!data) {
            // Handle case where user data is not found
            return res.status(404).send('User not found');
        }

        console.log(data);
        res.redirect('/profile/displayAccountDetails');
    } catch (error) {
        console.error('Error updating account details:', error);
        res.status(500).send('Internal Server Error');
    }
};


const manageAddress = async (req, res) => {
    let session=req.session.user
    if(req.session.user){
        try {
            const categ = await category.find();
    
            const data = await user.findOne({ email: req.session.user });
    
            if (!data) {
                // Handle case where user data is not found
                return res.status(404).send('User not found');
            }
    
            res.render('userProfile/addressManage.ejs', { data, categ,session });
        } catch (error) {
            console.error('Error rendering addressManage page:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userLogin')
    }

};

const addNewAddress = async (req, res) => {
    let session=req.session.user
    if(req.session.user){
        try {
            const categ = await category.find();
            res.render('userProfile/addNewAddress', { categ,session });
        } catch (error) {
            console.error('Error rendering addNewAddress page:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userLogin')
    }
   
};


const addNewAddressPost = async (req, res) => {

    try {
        const { fname, lname, addressLineOne, mobNo, pincode, city, state, gridRadios } = req.body;
        const newAddress = `${fname}, ${lname}, ${addressLineOne}, ${mobNo}, ${pincode}, ${city}, ${state}, ${gridRadios}`;

        // Assuming your user model is imported and defined as 'User'
        const updatedUser = await user.findOneAndUpdate(
            { email: req.session.user },
            { $push: { address: newAddress } },
            { new: true, useFindAndModify: false }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('User with updated address:', updatedUser);
        res.status(200).json({ message: 'Address added successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const editAddress = async (req, res) => {
    let session=req.session.user
    if(req.session.user){
        try {
            console.log("hi");
            const categ = await category.find();
            const ind = req.params.id;
            const data = await user.findOne({ email: req.session.user });
    
            if (!data) {
                // Handle case where user data is not found
                return res.status(404).send('User not found');
            }
    
            console.log(data);
            res.render("userProfile/addressEdit.ejs", { data, ind, categ,session});
        } catch (error) {
            console.error('Error rendering addressEdit page:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userLogin')
    }
    
};


const editAddressPost = async (req, res) => {
    console.log('pp');
    let session=req.session.user
    if(req.session.user){
        try {
            const index = req.params.id;
            console.log(index);
            const userEmail = req.session.user;
            const { fname, lname, inputAddress, mobNo, pincode, city, state, gridRadios } = req.body;
            const userm = await user.findOneAndUpdate(
                { email: req.session.user },
                { $set: { [`address.${index}`]: `${fname}, ${lname}, ${inputAddress}, ${mobNo}, ${pincode}, ${city}, ${state}, ${gridRadios}` } },
                { new: true }
            );
            console.log(userm);
            res.redirect('/profile/addressManage')
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }else{
        res.redirect('/userLogin')
    }
   
};

const deleteAddress = async (req, res) => {
    try {
        const id = req.params.id;

        const value = await user.findOneAndUpdate(
            { email: req.session.user },
            { 
                $unset: { [`address.${id}`]: 1 }, // unset the specific index
            },
            { new: true }
        );

        // Pull null values from the array after the unset operation
        const updatedValue = await user.findOneAndUpdate(
            { email: req.session.user },
            { 
                $pull: { address: null } // remove null values from the array
            },
            { new: true }
        );

        console.log(updatedValue);
        res.redirect('/profile/addressManage')
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).send('Internal Server Error');
    }
};

const myOrders = async (req, res) => {
    let session = req.session.user
    if(req.session.user){
        try {
            const categ = await category.find()
    
            const useremail = req.session.user;
            const data = await user.findOne({ email: useremail });
            
            if (!data) {
                // Handle the case where the user is not found
                return res.status(404).send('User not found');
            }
    
            const id = data._id;
            const orderdetails = await order.find({ customer: id })
                                            .sort({ _id: -1 })
                                            .populate('orderItems.product');
    
            
            res.render('userprofile/myOrders', { orderdetails,categ ,session});
        } catch (error) {
            console.error('Error fetching order details:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    else{

    }
    
};

const changeStatus = async (req, res) => {
    try {
        const { orderId, productId } = req.params;

        // Find the order
        const orderDetails = await order.findById(orderId);

        if (!orderDetails) {
            return res.status(404).send('Order not found');
        }

        // Find the order item corresponding to the productId
        const orderItem = orderDetails.orderItems.find(item => item.product.toString() === productId);

        if (!orderItem) {
            return res.status(404).send('Product not found in the order');
        }

        // Calculate the canceled quantity
        const canceledQuantity = orderItem.quantity;

        // Update product stock
        const productdata = await product.findById(productId);

        if (!productdata) {
            return res.status(404).send('Product not found');
        }

        // Adjust stock based on the canceled quantity
        productdata.quantity += canceledQuantity;

        // Mark the order item as canceled by setting isCanceled to true
        orderItem.isCanceled = true;
        orderItem.status = 'cancelled'

        // If all products are canceled, update order status to "cancelled"
        if (orderDetails.orderItems.every(item => item.isCanceled)) {
            orderDetails.orderStatus = 'cancelled';
        }

        // Find the wallet associated with the user who made the purchase
        const wallet = await walletcollection.findOne({ user: orderDetails.customer });

        if (!wallet) {
            return res.status(404).send('Wallet not found');
        }

        // Add a new transaction to the wallet with the amount equal to the subtotal of the canceled product
        const canceledAmount = orderItem.quantity * orderItem.price;
        wallet.transactions.push({ amount: canceledAmount, type: 'deposit' });
        
        // Update the balance of the wallet
        wallet.balance += canceledAmount;

        // Save the updated product, order, and wallet
        await productdata.save();
        await orderDetails.save();
        await wallet.save();

        res.status(200).json({ message: 'Product canceled successfully', orderDetails });
    } catch (error) {
        console.error('Error canceling product:', error);
        res.status(500).send('Internal Server Error');
    }
};




const invoice = async (req, res) => {
    try {
        const orderId = req.params.id;

        // Query the database to find the order details based on the order ID
        const Order = await order.findById(orderId).populate({ 
            path: 'customer',
            model: 'user' // Assuming the model name is 'user'
        }).populate('orderItems.product'); // Populate the product details in orderItems

        if (!Order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Calculate the discounted price
        // const totalCartPrice = Order.totalPrice;
        // const discount = totalCartPrice - Order.subtotal;
        // const discountedPrice = totalCartPrice - discount;

        const data = {
            apiKey: "free",
            mode: "development",
            images: {
                logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",
            },
            sender: {
                company: "Lens World",
                address: "Sample Street 123",
                zip: "1234 AB",
                city: "Thiruvanthapuram",
                country: "India"
            },
            client: {
                company: `${Order.customer.fname} ${Order.customer.lname}`,
                address: Order.shippingAddress,
                zip: '',
                city: '',
                country: ''
            },
            information: {
                number: Order._id.toString(),
                date: new Date().toISOString().split('T')[0],
                dueDate: Order.orderDate.toISOString().split('T')[0]
            },
            products: Order.orderItems.map(item => ({
                quantity: item.quantity,
                description: item.product.name,
                price: item.product.price,
                
            })),
            // totalPrice: totalCartPrice,
            // discount: discount,
            // discountedPrice: discountedPrice,
            
            bottomNotice: `Thank you for choosing LensWorld for your eyewear needs!`,
            settings: {
                currency: "INR"
            }
        };

        // Create the invoice
        easyinvoice.createInvoice(data, function (result) {
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="invoice-${Order._id}.pdf"`);
            // Send the PDF as response
            res.send(Buffer.from(result.pdf, 'base64'));
        });
        
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




const changePassword = async(req,res)=>{
    const categ = await category.find()
    let session = req.session.user
    if(session){
        res.render("userProfile/changePassword",{categ,session})
    }
    
}

const changePasswordPost = async (req, res) => {
    console.log(req.body);
    try {
        const data = await user.findOne({ email: req.session.user });
        const match = await bcrypt.compare(req.body.currentPassword, data.password);
        if (match) {
            const hashedPassword = await bcrypt.hash(req.body.newPassword,10)
            await user.findOneAndUpdate({email:req.session.user},{$set:{password:hashedPassword}})
            res.status(200).json({ success: true, message: "Password change successful" });
        } else {
            // Passwords do not match
            res.status(401).json({ success: false, message: "Current password is incorrect" });
        }
    } catch (error) {
        // Handle any errors that occur during the database query or password comparison
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

const Wallet = async(req,res)=>{
    try {
        const categ = await category.find();
        const session = req.session.user;
        const userdata = await user.findOne({email: session});
        if (!userdata) {
            // Handle the case where user data is not found
            return res.status(404).send('User data not found');
        }
        const id = userdata._id;
        const walletdetails = await walletcollection.find({user:id});
        if (!walletdetails) {
            // Handle the case where wallet data is not found
            return res.status(404).json('Wallet data not found');
        }
        console.log(walletdetails);
        res.render('userProfile/wallet', {categ, session, walletdetails});
    } catch (error) {
        console.error('Error fetching wallet details:', error);
        res.status(500).send('Internal server error');
    }
}

const returnOrderInit = async (req, res) => {
    console.log("[[[[[[[\\\\\\\\\\\\[\[\\[\[")
    const { orderId, productId, orderItemId } = req.params;
    const { reason } = req.body; // Assuming the return reason is provided in the request body
    console.log(reason)

    try {
        // Find the order and the specific order item
        const Order = await order.findById(orderId);
        if (!Order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderItem = Order.orderItems.find(item => 
            item.product.toString() === productId && item._id.toString() === orderItemId
        );

        if (!orderItem) {   
            return res.status(404).json({ message: 'Order item not found' });
        }

        // Update the returnRequested field to indicate that a return request has been initiated
        orderItem.returnRequested = true;
        orderItem.status = 'return-requested'

        // Optionally, store the return reason provided by the user
        if (reason) {
            orderItem.reason = reason;
        }

        // Save the changes to the order
        await Order.save();

        // Return a success response
        res.status(200).json({ message: 'Return request initiated successfully' });
    } catch (error) {
        console.error('Error initiating return request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const paymentPending = async (req, res) => {
    try {
        const { orderId, totalPrice, orderItemId } = req.body;
        
        const useremail = req.session.user;
        const userdata = await user.findOne({ email: useremail });

        req.session.pendingPaymentCapture = {
            orderId: orderId,
            userid: userdata._id,
            itemId: orderItemId
        };

        console.log(req.session.pendingPaymentCapture);

        // Initialize Razorpay instance with your key ID and secret
        const instance = new Razorpay({
            key_id: 'rzp_test_Go829W6FzY8Q7j',
            key_secret: 'PwkOJHuWLAIQ1WtpGKegEB7p'
        });

        // Set options for creating a new order
        const options = {
            amount: totalPrice*100,  // amount in the smallest currency unit
            currency: 'INR',
            receipt: orderId + Date.now() // Generate a unique receipt ID
        };

        // Create a new order using Razorpay API
        instance.orders.create(options, function (err, order) {
            if (err) {
                // If there's an error, send an error response
                console.error('Error creating Razorpay order:', err);
                return res.status(500).json({ error: 'Failed to create Razorpay order' });
            }
            // Send the order details back to the client as a JSON response
            res.status(200).json(order);
        });
    } catch (error) {
        // If an unexpected error occurs, send an error response
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
};
const pendingPaymentCapture = async (req, res) => {
    try {
        const orderId = req.session.pendingPaymentCapture.orderId
        const userId = req.session.pendingPaymentCapture.userid;
        const orderItemId = req.session.pendingPaymentCapture.itemId;
        
        console.log(orderItemId)
        // Retrieve the order data
        const orderdata = await order.findById({_id:orderId });

        console.log(orderdata)
        
        // Find the order item and update its status to "confirmed"
        const orderItemIndex = orderdata.orderItems.findIndex(item => item._id == orderItemId);
        if (orderItemIndex !== -1) {
            // Update order item status
            orderdata.orderItems[orderItemIndex].status = "confirmed";

            // Save the changes to the order document
            await orderdata.save();

            // Retrieve the product associated with the order item
            const productId = orderdata.orderItems[orderItemIndex].product;
            const productdata = await product.findById(productId);

            // Update the quantity in the product collection
            if (productdata) {
                // For example, decrease the quantity by 1
                productdata.quantity -= 1; // Adjust according to your logic
                await productdata.save();
            } else {
                throw new Error('Product not found');
            }

            res.redirect('/cart/orderSuccessPg')
            // res.status(200).json({ message: 'Payment captured successfully' });
        } else {
            throw new Error('Order item not found');
        }
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).json({ error: 'An error occurred while capturing payment' });
    }
};

module.exports ={
    updateAccountDetails,
    updateAccountDetailsPost,
    displayAccountDetails,
    manageAddress,
    addNewAddress,
    addNewAddressPost,
    editAddress,
    editAddressPost,
    deleteAddress,
    myOrders,
    changeStatus,
    invoice,
    changePassword,
    Wallet,
    changePasswordPost,
    returnOrderInit,
    paymentPending,
    pendingPaymentCapture
    
    
}