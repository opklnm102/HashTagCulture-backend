package spring.hashcul.dao;

import java.util.List;
import java.util.Map;

import spring.hashcul.model.ListInfoVo;

public interface ListDao {
	
    public List<ListInfoVo> getList(Map<String, Object> parameter);
    public List<ListInfoVo> getList();
    
    
    
}
