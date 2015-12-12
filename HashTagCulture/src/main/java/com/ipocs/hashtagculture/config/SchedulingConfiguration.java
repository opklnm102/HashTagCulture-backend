package com.ipocs.hashtagculture.config;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;

import com.ipocs.hashtagculture.scheduler.MyTask;

@Configuration
@EnableScheduling
@EnableAsync
public class SchedulingConfiguration implements SchedulingConfigurer {

	@Override
	public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
		
		taskRegistrar.setScheduler(taskRegistrar);
		taskRegistrar.addTriggerTask(new Runnable() {
			
			@Override
			public void run() {
				myTask().work();
			}
		},new CronTrigger("* * * * * ?") );
	}
	
	@Bean(destroyMethod = "shutdown")
	public Executor taskScheduler(){
		return Executors.newScheduledThreadPool(5);
	}
	
	@Bean
	public MyTask myTask(){
		return new MyTask();
	}
}
