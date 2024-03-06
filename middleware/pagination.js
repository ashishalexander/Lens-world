const product = require('../model/admin/prtMgmMdl')
// const categ = require('../model/admin/categoryMgm')






async function paginate(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
  
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
    
      const category = req.query.category || null;



      let query = {};  // Initialize an empty query

    // Check if category parameter is present in the request
    if (req.query.category) {
      query.category = req.query.category;
    }


      const items = await product.find(query).skip(startIndex).limit(limit).exec();
      const totalItems = await product.countDocuments(query);
    
      req.pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        hasNextPage: endIndex < totalItems,
        hasPrevPage: startIndex > 0,
        nextPage: endIndex < totalItems ? page + 1 : null,
        prevPage: startIndex > 0 ? page - 1 : null,
        category:req.query.category,
        
      };
  
      req.paginatedItems = items;   
  
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
  
  module.exports = paginate;