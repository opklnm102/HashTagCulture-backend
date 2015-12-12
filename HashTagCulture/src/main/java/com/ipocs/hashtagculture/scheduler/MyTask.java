package com.ipocs.hashtagculture.scheduler;

import org.springframework.scheduling.annotation.Async;

public class MyTask {
	
	@Async
	public void work(){
		 // task execution logic
		//Todo: 주기적으로 open api 정보 받아와서 DB에 저장하기	
	}

}
