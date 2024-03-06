const {Cart,CartItem} = require("../model/cart/cartSchema")
const user = require('../model/user/userModel')
const Product = require('../model/admin/prtMgmMdl')
const mongoose = require('mongoose');
const Order = require('../model/cart/orderSchema');
const category = require('../model/admin/categoryMgm')
const Razorpay = require('razorpay');
const crypto = require('crypto');
const wallet = require('../model/user/wallet')


// const addSubtotalToExistingCarts = async () => {
//     try {
//         // Update documents in the Cart collection where the subtotal field does not exist
//         await Cart.updateMany(
//             { subtotal: { $exists: false } }, // Filter condition
//             { $set: { subtotal: 0 } } // Update operation
//         );

//         console.log('Subtotal field added to existing carts successfully');
//     } catch (error) {
//         console.error('Error adding subtotal to existing carts:', error);
//     }
// };

// // Call the function to add the subtotal field to existing carts
// addSubtotalToExistingCarts();

var instance = new Razorpay({
    key_id: 'rzp_test_Go829W6FzY8Q7j',
    key_secret: 'PwkOJHuWLAIQ1WtpGKegEB7p',
  });


const getCart = async(req,res)=>{
    let session = req.session.user
    console.log(session)
    if(req.session.user){
        try{
            const categ = await category.find()
            const value = req.session.user
            const userobj = await user.findOne({email:value})
            const userId = userobj._id
            const userCart = await Cart.findOne({user:userId}).populate({
                path: 'items.product',
                model: 'prtmgmcoll', 
            
        
            })
            console.log(userCart)
            if (!userCart || userCart.items.length === 0) {
                // If the user's cart is empty, render another page (e.g., empty cart page)
                return res.render("cart/emptyCart", { categ, session });
            }
            res.render("cart/cartDetailPg",{userCart,categ,session})
           
        }catch (error) {
            console.error('Error getting user cart:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }else{
        res.redirect('/userLogin')
    }
}


const addCart = async(req,res)=>{
    let session = req.session.user
    console.log(session)
    if(req.session.user){
        try{
            
            const email = req.session.user
            console.log(email)
            const userobj = await user.findOne({email:email})
            const userId = userobj._id
            const prtid = req.params.id
            console.log(prtid)

            const data = await Product.findOne({_id:prtid})

            const person = await user.findById({_id:userId});
            if (!person) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            let userCart = await Cart.findOne({ user: userId });
            if (!userCart) {
                userCart = new Cart({ user: userId });
                await userCart.save();
            }
            const existingCartItem = userCart.items.find(item => item.product.equals(prtid));
            if (existingCartItem) {
                // If the product is already in the cart, increase the quantity
            return res.redirect('/cart/getCart')
            } else {
                const prt = await Product.findById(prtid);
                if (!prt) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                const newCartItem = new CartItem({ product: prtid, quantity: 1,price:data.price });
                userCart.items.push(newCartItem);

                
                // Recalculate the total price of all items in the cart
                const newTotalPrice = userCart.items.reduce((total, item) => total + item.price, 0);

                // Update the total price in the cart
                userCart.totalPrice = newTotalPrice;

            }

            await userCart.save();
            
            //  res.status(200).json({ message: 'Product added to the cart successfully' });
            return  res.redirect("/cart/getCart")

        } catch (error) {
            console.error('Error adding product to cart:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }else{
        res.redirect('/userLogin')
    }
  
}


const removeItem = async (req, res) => {
    try {
        const userEmail = req.session.user;
        const userObj = await user.findOne({ email: userEmail });

        if (!userObj) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userObj._id;
        const userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const productIdToRemove = req.params.id;

        // Use $pull to remove the item from the items array based on product ID
        const updateResult = await Cart.updateOne(
            { user: userId },
            { $pull: { items: { 'product': productIdToRemove } } }
        );

        if (updateResult.nModified === 0) {
            // No items were modified, meaning the item was not found in the cart
            return res.status(404).json({ error: 'Item not found in the cart' });
        }
        // Fetch the updated cart after the item is removed
        const updatedCart = await Cart.findOne({ user: userId });

        // Recalculate the total price of all items in the updated cart
        const newTotalPrice = updatedCart.items.reduce((total, item) => total + item.price, 0);

        // Update the total price in the cart
        updatedCart.totalPrice = newTotalPrice;

        if (updatedCart.items.length === 0) {
            // If no items in the cart, set subtotal to zero
            updatedCart.subtotal = 0;
        }

        // Save the changes to the cart
        await updatedCart.save();

        // return res.status(200).json({ message: 'Item removed from the cart successfully' });
        return res.redirect('/cart/getCart')

    } catch (error) {
        console.error('Error removing item from cart:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const stockCheck = async(req,res)=>{
    try {
        const { productId, newQuantity } = req.params;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the new quantity is less than or equal to the available stock
        const availableStock = product.quantity;
        console.log(product.quantity)
        console.log(newQuantity)

        if (parseInt(newQuantity, 10) > availableStock) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // If stock is available, send a success response
        res.status(200).json({ message: 'Stock available' });
    } catch (error) {
        console.error('Error checking stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const updateQuantity = async (req, res) => {
    try {
        const { productId, newQuantity } = req.params;
        const userEmail = req.session.user;

        // Assuming you have a User model
        const userObj = await user.findOne({ email: userEmail });

        if (!userObj) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = userObj._id;

        // Find the cart for the user
        const userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Find the cart item and update the quantity and price
        const cartItem = userCart.items.find(item => item.product.equals(productId));

        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in the cart' });
        }

        // Find the corresponding product to get the original price
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Calculate the new price based on the product price and new quantity
        const newPrice = product.price * parseInt(newQuantity, 10);

        // Update the quantity and price for the specified product in the cart
        cartItem.quantity = parseInt(newQuantity, 10);
        cartItem.price = newPrice;

        // Recalculate the total price of all items in the cart
        const newTotalPrice = userCart.items.reduce((total, item) => total + item.price, 0);

        // Update the total price in the cart
        userCart.totalPrice = newTotalPrice;

        // Save the changes to the cart
        await userCart.save();

        return res.status(200).json({ message: 'Quantity and price updated successfully', updatedCart: userCart });
    } catch (error) {
        console.error('Error updating quantity and price in the cart:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


const checkOut = async(req,res)=>{
    let session = req.session.user
    if(req.session.user){
        try{
            const categ = await category.find()
    
            const value = req.session.user
            const data = await user.findOne({email:req.session.user})
            const userobj = await user.findOne({email:value})
            const userId = userobj._id
            const userCart = await Cart.findOne({user:userId}).populate({
                path: 'items.product',
                model: 'prtmgmcoll', 
            
        
            })
            console.log(userCart)
            res.render("cart/paymentPg",{userCart,data,categ,session})
           
        }catch (error) {
            console.error('Error getting order detail page:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }else{
        res.redirect('/userLogin')
    }
    
}



const addAddress = async (req, res) => {
    let session = req.session.user
    if(req.session.user){
        try {
            const categ = await category.find();
            res.render('cart/addNewAddressCheckOut', { categ,session });
        } catch (error) {
            console.error('Error rendering addNewAddressCheckOut page:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userLogin')
    }
    
};


const addAddressPost = async (req, res) => {
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


const placeOrder = async (req, res) => {
    try {
        const { userId, shippingAddress, paymentMethod } = req.body;

        const userCart = await Cart.findOne({ user: userId }).populate('items.product');
        const totalPrice = userCart.items.reduce((total, item) => total + item.price, 0);

        if (paymentMethod === 'wallet') {
            const userWallet = await wallet.findOne({ user: userId });

            if (!userWallet) {
                return res.status(400).json({ success: false, message: 'User does not have a wallet.' });
            }

            if (userWallet.balance < totalPrice) {
                return res.status(400).json({ success: false, message: 'Insufficient funds in the wallet.' });
            }

            // Deduct the order amount from the wallet balance
            userWallet.balance -= totalPrice;

            // Create a transaction record for the withdrawal
            const withdrawalTransaction = {
                amount: totalPrice,
                type: 'withdrawal',
                date: new Date()
            };

            userWallet.transactions.push(withdrawalTransaction);
            await userWallet.save();
        }

        // Create a new Order instance
        const order = new Order({
            customer: userId,
            orderDate: new Date(),
            orderStatus: 'pending',
            orderItems: userCart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            totalPrice: totalPrice,
            subtotal: userCart.subtotal
        });

        await order.save();

        // Update product quantities in the database
        for (const cartItem of userCart.items) {
            const productId = cartItem.product._id;
            const orderedQuantity = cartItem.quantity;
            const product = await Product.findById(productId);
            product.quantity -= orderedQuantity;
            await product.save();
        }

        // Clear the user's cart
        userCart.items = [];
        userCart.totalPrice = 0;
        userCart.subtotal = 0;
        await userCart.save();

        res.status(200).json({ success: true, message: 'Order placed successfully.' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Error placing order.' });
    }
};

 

const onlinePayment = async (req, res) => {
    try {
        const { userId, shippingAddress, paymentMethod } = req.body;

        const userCart = await Cart.findOne({ user: userId }).populate('items.product');

        console.log(userId);
        console.log(userCart);

        for (const cartItem of userCart.items) {
            const availableStock = cartItem.product.quantity;
            if (cartItem.quantity > availableStock) {
                throw new Error(`Insufficient stock for product: ${cartItem.product.name}`);
            }
        }

        const totalPrice = userCart.items.reduce((total, item) => total + item.price, 0);
        req.session.paymentCapture = {
            userid:userId,
            address:shippingAddress,
            paymethod:paymentMethod

        }
        try {
            var instance = new Razorpay({
                key_id: 'rzp_test_Go829W6FzY8Q7j',
                key_secret: 'PwkOJHuWLAIQ1WtpGKegEB7p'
            });

            const rzpOrder = await instance.orders.create({
                amount: totalPrice,
                currency: "INR",
                receipt: "order_id" + Date.now(),
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            });
            req.session.orderId = rzpOrder.id
            console.log(rzpOrder)
            return res.status(200).json({ orderId: rzpOrder.id });
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            return res.status(500).json({ success: false, message: 'Error creating Razorpay order.' });
        }
    } catch (error) {
        console.error('Error in onlinePayment:', error);
        res.status(500).json({ success: false, message: 'Error processing online payment.' });
    }
};




const paymentCapture = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        console.log(req.body);

        const userCart = await Cart.findOne({ user: req.session.paymentCapture.userid }).populate('items.product');
        const totalPrice = userCart.items.reduce((total, item) => total + item.price, 0);

        console.log(userCart)

        // Create a new Order instance
        const order = new Order({
            customer: req.session.paymentCapture.userid,
            orderDate: new Date(),
            orderStatus: 'confirmed',
            orderItems: userCart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: req.session.paymentCapture.address,
            paymentMethod: req.session.paymentCapture.paymethod,
            totalPrice: totalPrice,
            subtotal:userCart.subtotal
        });

        console.log(order);

        // Save the order to the database
        await order.save();

        // Update product quantities in the database
        for (const cartItem of userCart.items) {
            const productId = cartItem.product._id;
            const orderedQuantity = cartItem.quantity;

            // Retrieve the product from the database
            const product = await Product.findById(productId);

            // Update product quantity in the database
            product.quantity -= orderedQuantity;
            await product.save();
        }

        // Clear the user's cart
        userCart.items = [];
        userCart.totalPrice = 0;
        userCart.subtotal = 0;
        
        // await Cart.updateOne({ _id: userCart._id }, { items: [], totalPrice: 0,discountedTotalPrice: 0 });

        await userCart.save();
    
        // Send a success response
        res.redirect("/cart/orderSuccessPg");
    } catch (error) {
        console.error('Error in paymentCapture:', error);
        res.status(500).json({ success: false, message: 'Error capturing payment.' });
    }
};





const   orderSuccessPg = async (req, res) => {

    const email = req.session.user;
    let session = req.session.user
    if(req.session.user){
        try {
            const categ = await category.find()
    
            const User = await user.findOne({ email: email });
        
            if (!User) {
                // Handle case where user with the given email is not found
                return res.status(404).send('User not found');
            }
        
            const id = User._id;
            const latestOrder = await Order.findOne({ customer: id }).sort({ orderDate: -1, _id: -1 });
    
        
            if (!latestOrder) {
                // Handle case where no order is found for the user
                return res.status(404).send('No order found for the user');
            }
        
            console.log(latestOrder);
            res.render('cart/orderSuccessPg.ejs',{latestOrder,categ,session});
        } catch (error) {
            console.error('Error fetching order data:', error);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.redirect('/userLogin')
    }
 
    
    
};


const paymentFailure = async (req, res) => {
    try {
        const address = req.params.selectedAddress
        console.log(address)
        // Retrieve the user's session data
        let session = req.session.user;

        // Find the user data
        const userData = await user.findOne({ email: session });

        // Check if userData is null or undefined
        if (!userData) {
            return res.status(404).send("User not found"); // Handle the case where user data is not found
        }

        // Extract the user's ID
        const userId = userData._id;

        // Query the cart data associated with the user
        const cartData = await Cart.findOne({ user: userId });

        // Check if cartData is null or undefined
        if (!cartData) {
            return res.status(404).send("Cart data not found"); // Handle the case where cart data is not found
        }

        // Create an array to store order items
        const orderItems = [];

        // Iterate over each item in the cart
        for (const cartItem of cartData.items) {
            // Create a new order item object
            const orderItem = {
                product: cartItem.product,
                quantity: cartItem.quantity,
                price: cartItem.price,
                status:'pending'
                // Add other properties as needed
            };

            console.log(orderItem)
            // Push the order item to the orderItems array
            orderItems.push(orderItem);
        }

        // Create a new order object
        const newOrder = new Order({
            customer: userId,
            orderDate: new Date(),
            orderStatus: 'pending', // Set the order status to pending
            orderItems: orderItems, // Add cart items to order items
            shippingAddress: address,
            paymentMethod: 'onlinepayment',
            totalPrice: cartData.totalPrice,
            subtotal: cartData.subtotal
        });

        // Save the new order to the database
        await newOrder.save();

        // Clear the user's cart
        cartData.items = [];
        await cartData.save();

        console.log("Order created and cart cleared successfully");

        res.redirect('/profile/myOrders')
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error"); // Handle other errors
    }
};

module.exports = {
    getCart,
    addCart,
    removeItem,
    stockCheck,
    updateQuantity,
    checkOut,
    addAddress,
    addAddressPost,
    placeOrder,
    orderSuccessPg,
    onlinePayment,
    paymentCapture,
    paymentFailure
    
}