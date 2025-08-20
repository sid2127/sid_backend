//using promises

const asynchandler = (requestHandler) => (req, res , next) =>(

    Promise.
    resolve(requestHandler(req, res, next)).
    catch((err => {
        next(err);
    }))
)


export {asynchandler}



//this is using try- catch method

// const ansynchandler = (fn) => async (req, res, next) =>{

//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(err.message || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }