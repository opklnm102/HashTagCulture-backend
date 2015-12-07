package spring.hashcul.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.mybatis.spring.support.SqlSessionDaoSupport;

import spring.hashcul.model.ListInfoVo;

public class ListDaoImpl extends SqlSessionDaoSupport implements ListDao {

	public List<ListInfoVo> getList(Map<String, Object> params) {
		
		List<ListInfoVo> list;
		list= (List<ListInfoVo>)getSqlSession().selectList("listdao.getList", params);
		return list;
	}

	public List<ListInfoVo> getList() {
		List<ListInfoVo> list;
		list= (List<ListInfoVo>)getSqlSession().selectList("listdao.getAllList");

		return list;
	}
	
	
	
	

}
