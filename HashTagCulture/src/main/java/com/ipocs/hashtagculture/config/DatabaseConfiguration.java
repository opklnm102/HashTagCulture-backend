package com.ipocs.hashtagculture.config;

import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.transaction.annotation.TransactionManagementConfigurer;

@Configuration
@EnableTransactionManagement
public class DatabaseConfiguration implements TransactionManagementConfigurer {

	@Bean(destroyMethod = "close")
	public DataSource dataSource() {
		BasicDataSource dataSource = new BasicDataSource();

		dataSource.setDriverClassName("com.mysql.jdbc.Driver");
		dataSource.setUrl("jdbc:mysql://52.192.175.169:3306/hashtagculture?autoReconnect=true&characterEncoding=utf8");
		dataSource.setUsername("springuser");
		dataSource.setPassword("1192006");

		return dataSource;
	}

	public SqlSessionFactoryBean SqlSessionFactory() throws Exception {
		SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();

		sessionFactory.setDataSource(dataSource());
		sessionFactory
				.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mappers/*xml"));

		return sessionFactory;
	}

	@Bean
	public PlatformTransactionManager transactionManager() {
		return new DataSourceTransactionManager(dataSource());
	}

	@Bean
	public MapperScannerConfigurer mapperScannerConfigurer() {

		MapperScannerConfigurer configurer = new MapperScannerConfigurer();

		configurer.setBasePackage("com.ipocs.hashtagculture");
		configurer.setAnnotationClass(org.springframework.stereotype.Repository.class);

		return configurer;
	}

	@Override
	public PlatformTransactionManager annotationDrivenTransactionManager() {
		return transactionManager();
	}

}
