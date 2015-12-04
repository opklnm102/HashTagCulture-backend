package spring.hashcul.dao;

import org.mybatis.spring.support.SqlSessionDaoSupport;

import spring.hashcul.model.ContactVo;

public class ContactDaoImpl extends SqlSessionDaoSupport implements ContactDao {


	public void create(ContactVo contact) {
		// TODO Auto-generated method stub
		
	}

	public ContactVo get(String email) {
		ContactVo contact = (ContactVo)getSqlSession().selectOne("contactdao.getUserByEmail", email);
        return contact;
	}

	public void update(String email, ContactVo contact) {
		// TODO Auto-generated method stub
		
	}
	
    public void delete(String email) {
        // TODO Auto-generated method stub

 }

}
