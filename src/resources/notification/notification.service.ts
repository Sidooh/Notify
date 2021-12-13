import Post from "@/resources/post/post.model";
import IPost from "@/resources/post/post.interface";

class PostService {
    /*
    * Create new post*/
    async create(title:string, body:string): Promise<IPost> {
        try {
            return await Post.create({title, body});
        } catch (e) {
            throw new Error('Unable to create post')
        }
    }
}

export default PostService