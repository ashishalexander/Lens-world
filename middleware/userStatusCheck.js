const users =  require('../model/user/userModel')

const userStatusCheck = async(req,res,next)=>{
        console.log('yyyrs')
        const email = req.session.user
        try {
            const user = await users.findOne({ email });
    
            if (user && user.status === false) {
                req.session.user = false;
                return res.redirect('/userLogin');
            } else {
                next();
            }
        } catch (error) {
            console.error('Error during user status check:', error);
            return res.status(500).send('Internal Server Error');
        }
    
}
    
module.exports= userStatusCheck