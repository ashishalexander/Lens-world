const user = require('../model/user/userModel.js')
const otp =require('../model/user/otpmodel.js')
const bcrypt =require('bcrypt')
const otpgenerator =require('otp-generator')
const nodemailer =require('nodemailer')
const product =require('../model/admin/prtMgmMdl')
const category = require('../model/admin/categoryMgm.js')
const wallet = require('../model/user/wallet.js')
const shortid = require('shortid');
const referral = require('../model/user/referral.js')
const banner = require('../model/admin/banner.js')



require('dotenv').config()

const transporter = nodemailer.createTransport({
    service : 'Gmail',
    auth: {
        user : process.env.MAIL_USER,
        pass : process.env.MAIL_PASS
    }
});




const dashboard = async(req,res) => {
    let session = req.session.user
    if(req.session.user){
        const categ = await category.find()
        const bannerImgCorousel = await banner.findOne({name:"corousel"})
        const bannerImgfirst = await banner.findOne({name:"first banner"})
        const bannerImgSecond = await banner.findOne({name:"second banner"})
        res.render('user/userDashboard',{categ:categ,session:session,bannerImgCorousel,bannerImgfirst,bannerImgSecond})
    }else{
        const categ = await category.find()
        const bannerImgCorousel = await banner.findOne({name:"corousel"})
        const bannerImgfirst = await banner.findOne({name:"first banner"})
        const bannerImgSecond = await banner.findOne({name:"second banner"})
        res.render('user/userHome.ejs',{categ:categ,session:null,bannerImgCorousel,bannerImgfirst,bannerImgSecond})
    }
   
};

const userDashboard = async(req,res)=>{
   
    if( req.session.user){
        let session = req.session.user
        const bannerImgCorousel = await banner.findOne({name:"corousel"})
        const bannerImgfirst = await banner.findOne({name:"first banner"})
        const bannerImgSecond = await banner.findOne({name:"second banner"})
        const categ = await category.find()
        console.log(bannerImgCorousel)
        res.render('user/userDashboard',{categ:categ,session:session,bannerImgCorousel,bannerImgfirst,bannerImgSecond})
    }
}

const userLogin = (req,res) =>{
    res.render('user/userLogin.ejs')
}
const userLoginPost = async(req,res)=>{
    console.log('hi')
    try{
        const check =await user.findOne({email:req.body.email})
        console.log('hii')
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch&&check.status==true){
            req.session.user =  req.body.email
            console.log('hiii')
            res.redirect('/userDashboard')
            console.log('hi')
        }
        else{
            if(!isPasswordMatch){
                res.render("user/userLogin",{error:"Wrong password"})
            }else{
                res.render("user/userLogin",{error:"ENTRY RESTRICTED PLEASE CONTACT ADMINISTRATOR"})
            }
            
        }
    }
    catch(error){
        res.render("user/userLogin",{error:"Email don't found in database"})
    }
}       

const userRegister = (req,res) =>{
    
    res.render('user/userRegister.ejs')
}

const verificationotp =(req,res) =>{
    if(req.session.data){
        data=req.session.data
        mailsender(data)
        res.render('user/otppage.ejs')
    }else{
        res.render('user/userHome')
    }
    
}

let genotp = () => {
    return otpgenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets:false, specialChars: false })
}

const mailsender = async (data) => {
    const generatedOTP = genotp();
    console.log(generatedOTP)
    const otpDocument = new otp({
        
        email: data.email,
        otp: generatedOTP
    });

    try {
        await otpDocument.save();
        // Send the email with the generated OTP
        transporter.sendMail({
            from: process.env.MAIL_USER,
            to: data.email,
            subject: "OTP Verification",
            text: "Verify Your Email Using the OTP",
            html: `<h3>Verify Your Email Using this OTP: ${generatedOTP}</h3>`,
        }, (err, info) => {
            if (err) {
                console.log("Error sending email:", err);
            } else {
                console.log("Email sent successfully. Message ID:", info.messageId);
            }
        });
    } catch (error) {
        console.error("Error saving OTP to the database:", error);
    }
    
}

const userRegisterPost =async (req,res) =>{
    
    const data ={
        fname : req.body.firstname,
        lname : req.body.lastname,
        email : req.body.email,
        mobNo : req.body.mobNo,
        password :req.body.Password,
        confirmpassword:req.body.confirmpassword
    }
    const hashedPassword = await bcrypt.hash(data.password,10)
    console.log("this is the hashed pass"+hashedPassword)
    const userdata ={
        fname : data.fname,
        lname : data.lname,
        email : data.email,
        mobNo : data.mobNo,
        password :hashedPassword,

    }
    console.log(userdata)
    req.session.data = userdata
    console.log(req.session.data+"knnnnnnnnnnnnn")
    const existinUser = await user.findOne({email:data.email})
    console.log(existinUser)
    if(existinUser){
        let error = "This account already exists"
        return res.render('user/userRegister',{error})
    }
    res.redirect("/otp")

}

const resendotp = (req,res)=>{
    console.log('xxxxxxx')
    mailsender(req.session.data)
    console.log('mm')
}

const otpvalidation = async (req, res) => {
    try {
        console.log('hizzz  ')
      const x = await otp.findOne({}).sort({ _id: -1 }).limit(1);
      console.log(x);
      const  otpvalue = req.body;
    
      console.log(otpvalue);
      console.log(otpvalue)
  
      if (x.otp == otpvalue.otp) {
        console.log('zzzzzzz')
        console.log(req.session.data);
        const newuser = await new user(req.session.data).save();
        const walletdata= await new wallet({user:newuser._id}).save();
        const uniqueid = shortid.generate()
        console.log(uniqueid);
        console.log(newuser);
        const referraldata = await new referral({
            referrer : newuser._id,
            referralCode :uniqueid,
        }).save();
        console.log(referraldata)

        console.log("hi");
        // Send success response
         res.json({ success: true, message: 'OTP verification successful',newuser });
        
       
       
      } else {
        // Send error response
         res.status(400).json({ success: false, message: 'Invalid OTP' });
        
      }
    } catch (error) {
      console.error(error);
      // Send error response in case of an exception
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
const logout =(req,res)=>{
    console.log(req.session)
    req.session.user = false
    console.log(req.session)
    res.redirect('/')
}
const ForgotPasswordEmail = (req,res) =>{
    res.render('user/ForgotPassword')
}
const ForgotPasswordEmailPost = async(req,res) =>{
    email =req.body.email
    const data = await user.findOne({email:req.body.email})
    if(data){
        console.log(data.status)
    
     if(data.status==true){
        if(data){
            mailsender(data)
            req.session.otpemail = req.body.email
            res.redirect('/ForgotPassVerifyotp')
        }else{
            res.render('user/ForgetPasswordEmail',{error:"Email doesn't exists"})
        }
    }else{
        res.render('user/ForgotOtp',{error:"This Email Id is been Blocked By Administrator"})
    }
    }else{
        res.render('user/ForgotPassword',{error:"Email doesn't exists"})
    }

}

const ForgotPasswordVerifyOtp = (req,res)=>{
    res.render('user/ForgotOtp')
}
const ForgotPassVerifyOtpPost =async(req,res) =>{
    const x = await otp.findOne({}).sort({_id:-1}).limit(1)
    const{digit1,digit2,digit3,digit4,digit5,digit6}= req.body
    const otpvalue =digit1+digit2+digit3+digit4+digit5+digit6
    console.log(otpvalue)
    if(x.otp == otpvalue){
        
        res.redirect('/ForgotResetPassword')
    }else{
        res.render('user/ForgotOtp.ejs',{error:'Invaid otp'})
    }
}

const ForgotResetPassword = (req,res)=>{
    res.render('user/ForgotResetPassword')
}
const ForgotResetPasswordPost = async(req,res) =>{
    const newPassword = req.body.password1
    const hashedPassword = await bcrypt.hash(newPassword,10)
    console.log('hi')
    console.log(hashedPassword)
    console.log(req.session.otpemail)
    await user.findOneAndUpdate({email:req.session.otpemail},{$set:{password:hashedPassword}},{new:true})
}


const userNav =(req,res)=>{
    res.render('user/userNav')
}
const userrefferal = (req,res)=>{
    const refereeId = req.params.id
    console.log(req.params.id)
    console.log('hiall'+refereeId)
    res.render('user/referral',{refereeId})
}




const referralPost = async (req, res) => {
    console.log(req.session)
  try {
    const { referralCode,refereeId } = req.body;

    // Validate the request data (e.g., check if referralCode is provided)

    // Query MongoDB to find the referrer document based on the referral code
    const referrerdata = await referral.findOne({ referralCode });

    if (!referrerdata) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Extract the referrer ID from the referrer document
    const referrerId = referrerdata.referrer;

   

    // Update the referrer document
    referrerdata.referees.push(referrerdata._id); // Assuming req.user contains the ID of the referee
    referrerdata.usageCount++;

    // Calculate the rewards
    const referrerReward = 40;
    const refereeReward = 20;

    // Update referrer's wallet balance
    const referrerWallet = await wallet.findOne({ user: referrerId });
    referrerWallet.balance += referrerReward;
    referrerWallet.transactions.push({ amount: referrerReward, type: 'deposit' });
    await referrerWallet.save();

    // Update referee's wallet balance
    console.log(req.session.data.email)
    const data = await user.findOne({email:req.session.data.email})
    const userid = data._id
    console.log(data)
    const refereeWallet = await wallet.findOne({user:userid});
    console.log(refereeWallet)
    refereeWallet.balance += refereeReward;
    refereeWallet.transactions.push({ amount: refereeReward, type: 'deposit' });
    await refereeWallet.save();

    // Save the changes to the referrer document
    await referrerdata.save();

    // Respond with a success message
    return res.status(200).json({ message: 'Referral successfully processed' });
  } catch (error) {
    console.error('Error processing referral:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
    dashboard,
    userLogin,
    userLoginPost,
    userRegister,
    userRegisterPost,
    verificationotp,
    otpvalidation,
    resendotp,
    userDashboard,
    logout,
    ForgotPasswordEmail,
    ForgotPasswordEmailPost,
    ForgotPasswordVerifyOtp,
    ForgotPassVerifyOtpPost,
    ForgotResetPassword,
    ForgotResetPasswordPost,
    userNav,
    userrefferal,
    referralPost
    
};

