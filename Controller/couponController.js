const coupon =require('../model/admin/couponManagement')
const {Cart,CartItem} = require("../model/cart/cartSchema")
const user = require("../model/user/userModel")


async function updateCouponStatus() {
    console.log("++++++++++-----------++++++++++++++------------+++++++++++")
    const currentDate = new Date();
    try {
        
        const coupons = await coupon.find();

        // Update isActive status for each coupon
        for (const item of coupons) {
            if (item.startDate > currentDate || currentDate > item.endDate) {
                item.isActive = false;
            } else {
                item.isActive = true;
            }
            // Save the updated coupon
            await item.save();
        }
        console.log('Coupon status updated successfully in db.');
    } catch (error) {
        console.error('Error updating coupon status:', error);
    }
}

// Call the function to update coupon status
updateCouponStatus();


const newCoupon = (req,res)=>{
    res.render('coupon/newCoupon')
}

const newCouponPost = async (req, res) => {
    try {
        const data = req.body
        // Assuming you have a Coupon model defined with Mongoose
        const newCoupon = new coupon(req.body);
        const savedCoupon = await newCoupon.save();
        console.log(savedCoupon)
        res.redirect('/coupon/couponMgmSys')
    } catch (error) {
        // Handle error appropriately, send error response
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const couponMgmSys = async(req,res)=>{
    const data = await coupon.find()
    res.render('coupon/couponMgmSys',{data})
}

const changeCouponStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await coupon.findById(id);

        if (!data) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Toggle the isActive status
        data.isActive = !data.isActive;

        // Save the updated coupon data
        await data.save();

        console.log(data);
        res.redirect("/coupon/couponMgmSys")
    } catch (error) {
        console.error('Error changing coupon status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const couponValidation = async (req, res) => {
    try {
        const couponCode = req.body.code;
        const userid = await user.findOne({ email: req.session.user }); // findOne instead of find
        const cartdata = await Cart.findOne({ user: userid._id }); // findOne instead of find


        if (!couponCode) {
            return res.status(400).json({ error: 'Coupon code is required' });
        }

        const couponData = await coupon.findOne({ code: couponCode });

        if (!couponData) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        if (!couponData.isActive) {
            return res.status(400).json({ error: 'Coupon is not active' });
        }

        const currentDate = new Date();
        if (currentDate < couponData.startDate || currentDate > couponData.endDate) {
            return res.status(400).json({ error: 'Coupon is expired or yet to start' });
        }

        if (couponData.usageLimit !== null && couponData.usageCount >= couponData.usageLimit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        const minCartAmount = couponData.minCartAmount;
        if (minCartAmount !== null && cartdata.totalPrice < minCartAmount) {
            return res.status(400).json({ error: `Minimum cart amount of ${minCartAmount} is required` });
        }

        
        // Calculate discounted total price
        let discountedTotalPrice = cartdata.totalPrice; // Assuming cartdata.totalPrice contains the total price of the cart
        if (couponData.discountType === 'percentage') {
            discountedTotalPrice *= (1 - couponData.discountAmount / 100); // Apply percentage discount
        } else if (couponData.discountType === 'fixed') {
            discountedTotalPrice -= couponData.discountValue; // Apply fixed amount discount
        }

        // Round off the discounted total price to two decimal places
        discountedTotalPrice = parseFloat(discountedTotalPrice.toFixed(2));

        // Update cartdata with discountedTotalPrice
        cartdata.subtotal = discountedTotalPrice;

        await cartdata.save(); // Save the updated cartdata

        console.log(cartdata);
        
        return res.status(200).json({ message: 'Coupon is valid' });
    } catch (error) {
        console.error('Coupon validation error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const remove = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedCoupon = await coupon.findByIdAndDelete(id);
        if (!deletedCoupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.redirect('/coupon/couponMgmSys')
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    newCoupon,
    newCouponPost,
    couponMgmSys,
    changeCouponStatus,
    couponValidation,
    remove
    
}