package com.zts.robot.service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zts.robot.mail.MailService;
import com.zts.robot.mapper.CheckCodeMapper;
import com.zts.robot.mapper.MatchMapper;
import com.zts.robot.mapper.MemberMapper;
import com.zts.robot.mapper.RaceTeamMemberMapper;
import com.zts.robot.mapper.TeamMapper;
import com.zts.robot.pojo.CheckCode;
import com.zts.robot.pojo.Match;
import com.zts.robot.pojo.Member;
import com.zts.robot.pojo.Team;
import com.zts.robot.util.Tools;

@Service
public class SignOnSiteService {
	@Autowired
	private MemberMapper memberMapper;
	@Autowired
	private CheckCodeMapper checkCodeMapper;
	@Autowired
	private RaceTeamMemberMapper raceTeamMemberMapper;
	@Autowired
	private TeamMapper teamMapper;
	@Autowired
	private MatchMapper matchMapper;
	
	/**
	 * 获取emailByDId 发送验证码
	 * @param didtype
	 * @param did
	 * @param ip
	 * @return
	 */
	public Map<String, Object> sendCheckCodeEmail(String didtype, String did, String ip,String mid) {
		// TODO 自动生成的方法存根
		String email="";
		String openedMatchMid = mid;
		Map<String, Object> memberMap= memberMapper.findMemberMapByDidMid(openedMatchMid,didtype,did);
		if(memberMap!=null){
			email = (String) memberMap.get("email");
			Date now = new Date();
			Calendar ca = Calendar.getInstance();
			ca.setTime(now);
			ca.add(Calendar.MINUTE, 120); //2小时内有效
			String expiredate = Tools.getStringByDateAndTime(ca.getTime());//当前系统时间+2小时
			
			String code = Tools.getRandom(4);
			CheckCode CheckCode = new CheckCode();
			CheckCode.setEmail(email);
			CheckCode.setCreatedate(Tools.getStringByDateAndTime(new Date()));
			CheckCode.setCheckcode(code);
			CheckCode.setIp(ip);
			CheckCode.setExpiredate(expiredate);
			CheckCode.setIsused("00"); //00未使用 01已使用
			checkCodeMapper.insert(CheckCode);
			
			//发送邮箱邮件
			String bodyHtml = "<div style='font-size:20px;background:#e4d480;padding:20px 10px'>"
					+ "<p style='font-family:“华文行楷”'>您好！</p>"
					+ "<p style='margin:20px 0;font-family:“华文行楷”'>"
					+ "您正在进行邮箱现场确认验证，本次请求的验证码为：<font color='red'>" + code +"</font>(为了保障您帐号的安全性，请在2小时内完成验证。)"
					+ "</p> "
					+ "</div>";
			MailService service = new MailService();// 新建邮件
			service.send(email, null, "机器人竞赛现场确认验证码", null, bodyHtml, null);
		}		
		return memberMap;
	}
	/**
	 * 根据验证码，更改现场确认状态
	 * @param email
	 * @param checkcode
	 * @param tmid 
	 * @return
	 */
	public int signOnSite(String email, String checkcode, String tmid) {
		// TODO 自动生成的方法存根
		int status = 1;
		Integer cnt = checkCodeMapper.verifyCheckCode(email, checkcode);
		if (cnt > 0) {
			String usedate = Tools.getStringByDateAndTime(new Date());
			checkCodeMapper.modifyCheckCodeByEmail(email,checkcode, usedate);
			//验证码正确,更新现场状态
			Member member = new Member();
			member.setTmid(tmid);
			member.setCkstatus("00");
			memberMapper.updateByPrimaryKeySelective(member);
			status = 0;
			return status;
		}
		return status;
	}
	public void signOnSiteNew(String didtype, String did, Map<String, Object> resultMap, String mid) {
		// TODO 自动生成的方法存根
		Map<String, Object> memberMap= memberMapper.findMemberMapByDidMid(mid,didtype,did);
		
		if(memberMap==null){
			resultMap.put("status", 1);
			resultMap.put("errmsg", "未找到对应的参赛人员，请核实填写信息！");
			return;
		}
		if("00".equals(memberMap.get("ckstatus"))){
			resultMap.put("status", 1);
			resultMap.put("errmsg", "已签到完成！");
			return;
		}
		Member member = new Member();
		member.setTmid((String) memberMap.get("tmid"));
		member.setCkstatus("00");
		memberMapper.updateByPrimaryKeySelective(member);
		String tmid=memberMap.get("tmid").toString();
		List<Map<String, Object>> tidList= raceTeamMemberMapper.findAllTidByTmid(tmid,mid);
		for (Map<String, Object> map:tidList) {
			String tid=map.get("tid").toString();
			Team team=new Team();
			team.setTid(tid);
			team.setCkstatus("00");
			teamMapper.updateByPrimaryKeySelective(team);
		}
		resultMap.put("status", "0");
		
	}
	public Match findGpsByMid(String mid) {
		// TODO Auto-generated method stub
		return matchMapper.selectByPrimaryKey(mid);
	}
	
	
}
