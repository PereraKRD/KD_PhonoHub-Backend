class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    // Search Feature (Filter)
    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                // mongo operators always starts with $ sign
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}
        
        // for check
        //console.log(keyword);

        this.query = this.query.find({ ...keyword });
        return this;
    
    }

    filter(){
        const queryCopy = { ...this.queryStr }

        // for check
        //console.log(queryCopy);

        //Removing Fields from the query
        const removeFields = ['keyword','limit','page']
        removeFields.forEach(el => delete queryCopy[el]);

        // for check
       // console.log(queryCopy);

        // Advance filter for price, ratings
        let queryStr = JSON.stringify(queryCopy)

        // for check
        //console.log(queryStr);

        queryStr = queryStr.replace(/\b(gt|gte|ly|lte)\b/g, match => `$${match}`)

        // convert JSON into Query
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1; // if current page is does not exist then by default it will be one
        const skip = resPerPage * (currentPage - 1); //assume current page is 2 then we will skip 4*(2-1) => 4 items

        this.query = this.query.limit(resPerPage).skip(skip); // limit means that we want to limit the number of items that will be return. {--{{DOMAIN}}/api/v1/products?page=2--}
        return this;
    }
}

module.exports = APIFeatures