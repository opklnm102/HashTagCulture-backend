package com.ipocs.hashtagculture.dao;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.ipocs.hashtagculture.dto.CultureInfo;

@Repository("cultureInfoDao")
public interface CultureInfoDao {
	
	List<CultureInfo> getCultureInfoList();
	
	CultureInfo getCultureInfo(Long cultureInfoId);
	
	void insertCultureInfo(CultureInfo cultureInfo);
	
	Integer updateCultureInfo(CultureInfo cultureInfo);
	
	Integer deleteCultureInfo(Long cultureInfo);

}
