const product =require('../model/admin/prtMgmMdl')
const category =  require('../model/admin/categoryMgm')



const productDetailPg =async(req,res)=>{
    const id =req.params.id
    console.log(id)
    let session = req.session.user
    if(req.session){
        const categ = await category.find()
        const dataproduct= await product.findById(id)
        res.render('user/ProductDetailPageB.ejs',({dataproduct,categ,session}))

    }else{
        const categ = await category.find()
        const dataproduct= await product.findById(id)
        res.render('user/ProductDetailPageB.ejs',({dataproduct,categ,session}))
    }
}


const dynamicProductListing = async(req,res)=>{
    let session = req.session.user
    if(req.session){
        const categ = await category.find()
        const brand = await product.distinct("brand")
        console.log(brand)
        res.render('user/dynamicProductListing.ejs', { prtdata: req.paginatedItems, pagination: req.pagination,categ:categ,session,brand });

    }else{
        const categ = await category.find()
        const brand = await product.distinct("brand")
        res.render('user/dynamicProductListing.ejs', { prtdata: req.paginatedItems, pagination: req.pagination,categ:categ,session:null,brand });

    }
    
}


const search = async (req, res) => {
    console.log('hiasasasasaasasas')
    try {
      const searchTerm = req.query.searchTerm;
      const products = await product.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } }
        ]
      });
      console.log(products)
      req.session.product = products
      res.status(200).json(products);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'An error occurred while searching products' });
    }
  };

  const searcheditem = async (req, res) => {
    try {
        const products = req.session.product; // Assuming product data is sent in the request body
        console.log(product);
        let session = req.session.user
        const categ = await category.find()
        const brand = await product.distinct("brand")

        // const brand = await product.distinct("brand")

        // const categ = await category.find()
        

        res.render('user/latestQueryPage', { products,session,categ,brand }); // Assuming you're using a template engine like EJS
        // Optionally, you can set the HTTP status code before sending the response
    } catch (error) {
        console.error('Error rendering product details:', error);
        res.status(500).send('Internal Server Error');
    }
}

const applyFilter = async(req,res)=>{
    console.log(req.body)
    try {
        // Extract filter criteria from request body
        const { brand, minPrice, maxPrice, category } = req.body;
        console.log(brand,minPrice,maxPrice,category)

        // Construct filter object based on available criteria
        const filter = {};
        if (brand) {
            filter.brand = brand;
        }
        if (minPrice && maxPrice) {
            filter.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        } else if (minPrice) {
            filter.price = { $gte: parseInt(minPrice) };
        } else if (maxPrice) {
            filter.price = { $lte: parseInt(maxPrice) };
        }

        // If category is provided, add it to the filter
        if (category) {
            filter.category = category;
        }

        // Find products based on filter
        const filteredProducts = await product.find(filter);
        // console.log(filteredProducts)
        // Send filtered products as response
        res.json(filteredProducts);
    } catch (error) {
        // Handle errors
        console.error('Error applying filter:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

}

const sortByPrice = async (req, res) => {
    try {
        const { brand, minPrice, maxPrice, category } = req.body;

        let query = {};
        if (brand) query.brand = brand;
        if (minPrice && maxPrice) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice) {
            query.price = { $gte: minPrice };
        } else if (maxPrice) {
            query.price = { $lte: maxPrice };
        }
        if (category) query.category = category; // Include category in the query if provided

        let products = await product.find(query);
        products.sort((a, b) => a.price - b.price);
        console.log(products)
        res.status(200).json(products);
    } catch (error) {
        console.error('Error sorting products by price:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const allFilter = async (req, res) => {
    try {
        const { brand, minPrice, maxPrice } = req.body;
        console.log(brand,minPrice,maxPrice)
        let query = {};
        if (brand) {
            query.brand = brand;
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.price = { $gte: minPrice, $lte: maxPrice };
        } else if (minPrice !== undefined) {
            query.price = { $gte: minPrice };
        } else if (maxPrice !== undefined) {
            query.price = { $lte: maxPrice };
        }

        // Query the database with the constructed query object
        const filteredProducts = await product.find(query);
        console.log(filteredProducts)

        res.status(200).json(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
   
    productDetailPg,
    dynamicProductListing,
    search,
    searcheditem,
    applyFilter,
    sortByPrice,
    allFilter


}