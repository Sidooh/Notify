import {NextFunction, Request, Response, Router} from "express";
import Controller from "@/utils/interfaces/controller.interface";
import validationMiddleware from '@/middleware/validation.middleware'
import validate from '@/resources/post/post.validation'
import HttpException from "@/utils/exceptions/http.exception";
import PostService from "@/resources/post/post.service";

class PostController implements Controller {
    path: string = '/posts';
    router: Router = Router();
    #PostService = new PostService()

    constructor() {
        this.#initRoutes()
    }

    #initRoutes(): void {
        this.router.post(`${this.path}`, validationMiddleware(validate.create), this.#create)
    }

    #create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const {title, body} = req.body

            const post = await this.#PostService.create(title, body)

            res.status(201).json({post})
        } catch (e: any) {
            next(new HttpException(400, e.message))
        }
    }
}

export default PostController