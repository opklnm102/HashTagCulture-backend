 package spring.hashcul.service;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.springframework.web.bind.annotation.RequestParam;

import spring.hashcul.dao.ListDao;
import spring.hashcul.model.ListInfoVo;
 

 
@Path("/list")
public class ListService {
        static ListDao dao = null;
        public void setListDao(ListDao dao){this.dao = dao;}
        public ListService(){
               //if(dao == null)      setContactDao(new ContactDao());
        }
       
        /**
         * Query Contact record by email id
         * @param email
         * @return
         */
        
        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public List<ListInfoVo> searchList(@RequestParam Map<String, Object> params){	
        	return dao.getList(params);
        }

        
        
        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public List<ListInfoVo> getlist() {
            return dao.getList();
        }

}