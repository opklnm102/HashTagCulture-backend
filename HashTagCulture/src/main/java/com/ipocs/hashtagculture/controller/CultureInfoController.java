package com.ipocs.hashtagculture.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.ipocs.hashtagculture.dto.CultureInfo;
import com.ipocs.hashtagculture.dto.Result;
import com.ipocs.hashtagculture.service.CultureInfoManager;

@RestController("cultureInfoController")
@RequestMapping(value = "/cultureinfo")
public class CultureInfoController {
	
	@Autowired
	private CultureInfoManager manager;
	
	 /**
     * 문화정보 목록 조회
     *
     * @return 문화정보 목록
     */
	@RequestMapping(value="/list", method= RequestMethod.GET)
	public Result getCultureInfoList(){
		List<CultureInfo> cultureInfoList;
		Result result = new Result();
		
		try{
			cultureInfoList = manager.getCultureInfoList();
			
			result.setResult("ok");
			result.setData(cultureInfoList);
		}catch(Exception e){
			e.printStackTrace();
			
			result.setResult("fail");
		}
		
		return result;
	}
	
    /**
     * 문화정보 등록
     *
     * @param cultureInfo 문화정보
     *
     * @return 처리 결과
     */
	@RequestMapping(method = RequestMethod.POST)
	public Result insertPost(@RequestBody CultureInfo cultureInfo){
		Result result = new Result();
		
		try{
			manager.saveCultureInfo(cultureInfo);
			
			result.setResult("ok");
		}catch(Exception e){
			e.printStackTrace();
			
			result.setResult("fail");
		}
		return result;
	}
	
	 /**
     * 문화정보 상세 조회
     *
     * @param cultureInfoId 문화정보 시퀀스
     *
     * @return 처리 결과
     */
	@RequestMapping(value = "/{cultureInfoId}", method = RequestMethod.GET)
	public Result getCultureInfo(@PathVariable(value = "cultureInfoId") Long cultureInfoId){
		Result result = new Result();
		
		try{
			CultureInfo cultureInfo = manager.getCultureInfo(cultureInfoId);
			
			result.setResult("ok");
			result.setData(cultureInfo);
		}catch(Exception e){
			e.printStackTrace();
			
			result.setResult("fail");
		}
		return result;
	}
	
	/**
     * 문화정보 수정
     *
     * @param cultureInfo   문화정보
     * @param cultureInfoId 문화정보 시퀀스
     *
     * @return 처리 결과
     */
	@RequestMapping(value = "/{cultureInfoId}", method = RequestMethod.PUT)
	public Result updatePost(@RequestBody CultureInfo cultureInfo, @PathVariable(value = "cultureInfoId") Long cultureInfoId){
		Result result = new Result();
		
		try{
			if(!cultureInfoId.equals(cultureInfo.getId())){
				throw new Exception("Invalid access!");
			}
			
		manager.saveCultureInfo(cultureInfo);
		result.setResult("ok");
		}catch(Exception e){
			e.printStackTrace();
			
			result.setResult("fail");
		}
		
		return result;
	}
	
	   /**
     * 문화정보 삭제
     *
     * @param cultureInfoId 문화정보 시퀀스
     *
     * @return 처리 결과
     */
	@RequestMapping(value = "/{cultureInfoId}", method = RequestMethod.DELETE)
	public Result deletePost(@PathVariable(value = "cultureInfoId") Long cultureInfoId){
		Result result = new Result();
		
		try{
			manager.deleteCultureInfo(cultureInfoId);
			result.setResult("ok");
		}catch(Exception e){
			e.printStackTrace();
			
			result.setResult("fail");
		}
		
		return result;
	}
}
