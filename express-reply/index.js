
const stream = require('stream');

const isSuccessCode = (code) => code >= 200 && code < 300;
const isStream = (body) => body instanceof stream.Readable || body instanceof stream.Duplex;

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 */
function ReplyMiddleware (req, res, next) {

    res._reply = function(response, options = {pretty: true, log: 'error'}){
        options.pretty = typeof options.pretty === 'boolean' ? options.pretty : true;

        if (response instanceof Error) {
            res.writeHead(statusCode, {...headers, 'content-type':'application/json'});
            var reply = { 
                code: 500, 
                status: "error", 
                format: "text/plain", 
                message: response.message,
            }
            //console.log('body', body);
            (options.log === 'error' || options.log === 'all') && console.error(response);
            return res.end( options.pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }

        let {statusCode, code, body, headers, format, props, noWrap} = response; 
        code = statusCode || code || (typeof body !== "undefined" && body != null && body instanceof Error ? 500 : 200);
        props = props || {};
        headers = headers || {};

        if (noWrap === true){
			res.writeHead(code, headers);

            if (isStream(body)) return body.pipe(res);
            
            return res.end(body);
		}

        if (typeof body === 'string' || body instanceof Buffer){
            // console.log("string or buffer body");
            res.writeHead(statusCode, {...headers, 'content-type':'application/json'});
            var reply = { 
                code, 
                status: "success", 
                format: format || headers['content-type'] || (body instanceof Buffer ? "buffer" : "text/plain"), 
                response: body,
				...props
            }
            (options.log === 'all') && console.error(`Success [${code}] [${reply.format}]`);
            res.end( pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        } 
        else if(body instanceof Error){
            // console.log("error body");
            res.writeHead(statusCode, {...headers, 'content-type':'application/json'});
            var reply = { 
                code, 
                status: "error", 
                format: "text/plain", 
                message: body.message,
				...props
            }
            (options.log === 'error' || options.log === 'all') && console.error(`[${code}]`, body);
            res.end( pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }
        else if(body instanceof stream.Readable || body instanceof stream.Duplex){
            // headers['content-type'] = headers['content-type'] || 'application/octet-stream';
            // res.writeHead(statusCode, headers);
            (options.log === 'all') && console.error(`[${code}]`, "+-+ [STREAM] +-+");
            body.pipe(res);
        }
		else if (body == null){
            // Object.entries(headers).length && res.writeHead(statusCode, headers);
            (options.log === 'all') && console.error(`[${code}] [${reply.format}]`);
            res.writeHead(statusCode, headers);
            res.end(JSON.stringify({ 
                code, 
                status: isSuccessCode(statusCode) ? "success" : "error", 
                format: "none" , 
                ...props
            }))
        }
        else {
            // console.log("default body");
            //
            (options.log === 'all') && console.error(`Success [${code}] [${reply.format}]`);
            res.writeHead(statusCode, {...headers, 'content-type':'application/json'});
            var reply = { 
                code, 
                status: "success", 
                format: format || headers['content-type'] || "application/json", 
                response: body ,
				...props
            }
            (options.log === 'all') && console.error(`Success [${code}] [${reply.format}]`);
            res.end( pretty ? JSON.stringify(reply, null, 2): JSON.stringify(reply) ) 
        }
    }
    next();
}

module.exports = ReplyMiddleware