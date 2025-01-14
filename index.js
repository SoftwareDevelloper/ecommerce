const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { error } = require("console");

app.use(express.json());
app.use(cors());
mongoose.connect("mongodb+srv://ecommerce:hopehorizonEcommerce@cluster0.670b7.mongodb.net/ecommerce",{
  
}).then(()=>{
    console.log("MongoDB connected successfully");
}).catch((error)=>{
    console.error("Error connecting to MongoDB :" , error)
});

app.get("/" ,(req,res) =>{
    res.send("Express App is running")
});

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload  = multer ({storage:storage});

app.use('/images',express.static('upload/images'));
app.post("/upload",upload.single('product'),(req,res) =>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})
const products =mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    oldprice:{
        type:Number,
        required:true,
    },
    newPrice:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    }

})
// add product
app.post('/addProduct', async (req, res) => {
    let product = await products.find({});
    let id;
    if (product.length > 0) {
        let last_product_array = product.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }

    const produit = new products({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        oldprice: req.body.oldprice,
        newPrice: req.body.newPrice,
    });

    console.log(produit);

    await produit.save();
    console.log("saved");

    res.json({
        success: true,
        name: req.body.name,
    });
});
// remove product
app.post('/removeProduct',async (req,res) => {
    await products.findOneAndDelete({id: req.body.id});
    console.log('removed');
    res.json({
        success:true,
        name:req.body.name,
    })
})
// fetch all product
app.get('/allProducts' , async (req,res) =>{
    let product = await products.find({});
    console.log("All product Fetched");
    res.send(product);
} )
const Users  = mongoose.model('Users',{
    name:{
        type:String
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String
    },
    cartData:{
        type:Object,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})
//register
app.post('/register',async(req,res)=>{
    let check = await Users.findOne({
        email:req.body.email
    })
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with the same email address"})
    }
    let cart = {}
    for (let i =0 ; i<300; i++)
    {
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:{},
    })
    await user.save();
    const data = {
        user :{
            id: user.id
        }
    }
    const token = jwt.sign(data,'secret_ecomm');
    res.json({success:true,token})
})

//login
app.post('/Login',async (req,res) =>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password ===user.password;
        if(passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecomm');
            res.json({success:true,token})
        }
        else{
            res.json({
                success:false,
                errors:"Wrong Password"
            })
        }
    }
    else{
        res.json({
            success:false,
            errors:"Wrong Email id"
        })
    }
})







app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port " + port)
    }else{
        console.log("Error:"+error)
    }
});

    