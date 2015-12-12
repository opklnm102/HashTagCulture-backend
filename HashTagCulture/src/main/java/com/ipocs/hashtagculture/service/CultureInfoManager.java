package com.ipocs.hashtagculture.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ipocs.hashtagculture.dao.CultureInfoDao;
import com.ipocs.hashtagculture.dto.CultureInfo;

@Service("cultureInfoManager")
public class CultureInfoManager {
	
	@Autowired
	private CultureInfoDao dao;

	 /**
     * 문화정보 목록 조회
     *
     * @return 문화정보 목록
     */
	public List<CultureInfo> getCultureInfoList(){
		return dao.getCultureInfoList();
	}
		
	/**
     * 문화정보 등록/수정 처리
     * <p/>
     * 문화정보의 시퀀스(일련번호)가 존재할 경우 수정 처리. 없을 경우에는 신규 등록 처리.
     *
     * @param cultureInfo 문화정보
     */
	@Transactional
	public void saveCultureInfo(CultureInfo cultureInfo){
		if(cultureInfo.getId() == null){
			dao.insertCultureInfo(cultureInfo);
		}else{
			dao.updateCultureInfo(cultureInfo);
		}
	}
	
	/**
     * 문화정보 상세 조회
     *
     * @param cultureInfoId 문화정보 시퀀스
     *
     * @return 문화정보
     */
	public CultureInfo getCultureInfo(Long cultureInfoId){
		return dao.getCultureInfo(cultureInfoId);
	}
	

    /**
     * 문화정보 삭제
     *
     * @param cultureInfoId 문화정보 시퀀스
     */
	public void deleteCultureInfo(Long cultureInfoId){
		dao.deleteCultureInfo(cultureInfoId);
	}
}
