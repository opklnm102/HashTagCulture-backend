package com.putian.dispatch.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.putian.dispatch.dao.UserMapper;
import com.putian.dispatch.domain.User;
import com.putian.dispatch.service.UserServiceI;

@Service("userService")
 public class UserServiceImpl implements UserServiceI {
 
     /**
      * 使用@Autowired注解标注userMapper变量，
      * 当需要使用UserMapper时，Spring就会自动注入UserMapper
      */
     @Autowired
     private UserMapper userMapper;//注入dao
 
     public UserMapper getUserMapper() {
		return userMapper;
	}

	public void setUserMapper(UserMapper userMapper) {
		this.userMapper = userMapper;
	}

	//     @Override
     public void addUser(User user) {
         userMapper.insert(user);
     }
 
//     @Override
     public User getUserById(String userId) {
         return userMapper.selectByPrimaryKey(userId);
     }
     
//     @Override
     public List<User> getAllUser() {
         return userMapper.getAllUser();
     }
}