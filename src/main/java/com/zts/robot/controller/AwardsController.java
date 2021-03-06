package com.zts.robot.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.zts.robot.service.AwardsService;

import net.sf.json.JSONArray;

@Controller
public class AwardsController {
	@Autowired
	private AwardsService awardsService;
	/**
	 * 设置该赛项下的奖项分配
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/setAwardsByRid")
	@ResponseBody
	public Map<String, Object> setAwardsByRid(HttpServletRequest request, HttpServletResponse response) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			String rid = request.getParameter("rid");//获取赛项id
			String 	awardsJson = request.getParameter("awardsJson");
			JSONArray awardsJsonArray = JSONArray.fromObject(awardsJson);//把字符串转换成json数组
			awardsService.setAwardsByRid(awardsJsonArray,rid,resultMap);	
		}catch (RuntimeException e){
			resultMap.put("status", 1);
		}catch (Exception e) {
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统错误！更新奖项失败！");
			e.printStackTrace();
		}		
		return resultMap;
	}
	/**
	 * 获取赛项下的奖项分配
	 * @param request
	 * @param response
	 * @return
	 */
	@RequestMapping("/findAwardsByRid")
	@ResponseBody
	public Map<String, Object> findAwardsByRid(HttpServletRequest request, HttpServletResponse response) {
		Map<String, Object> resultMap = new HashMap<String, Object>();
		try {
			String rid = request.getParameter("rid");
			
			List<Map<String, Object>> awardsList = awardsService.findAwardsByRid(rid);	
			resultMap.put("status", 0);
			resultMap.put("list", awardsList);
		} catch (Exception e) {
			resultMap.put("status", 1);
			resultMap.put("errmsg", "系统错误！获取奖项设置失败！");
		}		
		return resultMap;
	}
	
	
}
