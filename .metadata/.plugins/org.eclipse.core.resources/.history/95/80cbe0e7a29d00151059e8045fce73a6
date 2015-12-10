package com.putian.dispatch.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.putian.dispatch.domain.User;
import com.putian.dispatch.service.UserServiceI;

@Controller
public class UserController {

	private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);
	
	@Autowired
	private UserServiceI userService;
	 
	 @RequestMapping(value = "/user/getuser")
		public @ResponseBody User auth(
				@ModelAttribute User us) {
		 LOGGER.info("[auth] Get User");
			User user = userService.getUserById("1");
			if (user == null) {
				return new User();
			} else {
				return user;
			}
		}
}
