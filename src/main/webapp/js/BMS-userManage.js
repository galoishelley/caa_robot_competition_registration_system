$(function(){
	if(sessionStorage.getItem("roleflg")=="04"){
		$(".adminuser").hide();
	}
	bmsgetcurmatchname();
	getDefault();
	var jsonobj=JSON.parse(sessionStorage.getItem("userlistJson"));
	var num="";
	if(jsonobj!=undefined){
		num=jsonobj.pageNo;
		$("#searchsex").attr("altvalue",jsonobj.sex);
		if(jsonobj.sex!=""){
			$("#searchsex").val($("#searchsex").next().find("[altvalue="+jsonobj.sex+"]").text());
		}
		$("#searchschool").val(jsonobj.school);
		$("#searchdepart").val(jsonobj.departname);
		$("#str").val(jsonobj.str);
		$("#status").attr("altvalue",jsonobj.status);
		if(jsonobj.status!=""){
			$("#status").val($("#status").next().find("[altvalue="+jsonobj.status+"]").text());
		}
	}else{
		num=0
	}
	getAllMem(num);
	 $(".selinput").click(function(e){
     	e.stopPropagation();
     	var me=this;
     	$(me).next().show();
     	$(me).next().children().click(function(){
     		$(me).val($(this).text());
     		$(me).attr("altvalue",$(this).attr("altvalue"));
     		$(me).next().hide();
     	})
     })
     $(document).click(function(){
    		$(".emulate").hide();
    	})
})
var temp;
var picurl="";
var defaultstatus="";
function getAllMem(num){
	var sex=$("#searchsex").attr("altvalue");
	var school=$("#searchschool").val();
	var departname=$("#searchdepart").val();
	var str=$("#str").val();
	var status=$("#status").attr("altvalue")
	var pageSize=10;
	$("#page").unbind().data("pagination", null).empty();	
	$("#page").pagination({
		pageIndex: num,
		pageSize : pageSize,
		showFirstLastBtn : true,
		showPrevious: true,
	    showNext: true,
	    autoHidePrevious: true,
	    autoHideNext: true,
	    showJump: true,
	    jumpBtnText:'跳转',
		remote : {
			"url" : "../findAllregistered",
			pageParams : function(data) {
				var param={};
				param.pageNo=data.pageIndex;
				param.sex=sex;
				param.school=school;
				param.departname=departname;
				param.str=str;
				param.status=status;
				sessionStorage.setItem("userlistJson", JSON.stringify(param));
				return {
					iDisplayStart : data.pageIndex * data.pageSize,
					iDisplayLength : data.pageSize,
					"sex":sex,
					"school":school,
					"departname":departname,
					"str":str,
					"roleflg":"03",
					"status":status
				};
			}, // [Function]:自定义请求参数
			"success" : function(data, status) {
				console.log(data)
				if (data.status == 0) {
					$("tbody").empty();
					
					
					var htmls="";
					$.each(data.list,function(i,mem){
						htmls+='<tr><td uid="'+mem.uid+'" status="'+mem.status+'"><input type="checkbox"></td><td><img class="memberhead" src="'+mem.picurl+'">'
				    			+'<span>'+mem.uname+'</span></td><td>报名用户</td>'
				    	
				    	htmls+='<td><img src="../images/'+(mem.sex=="01"?'male.png':'female.png')
				    			+'"></td>'
						
								+'<td>'+mem.email+'</td>'
								+'<td>'+mem.phone+'</td>'
								+'<td>'+mem.school+'</td>'
								+'<td>'+mem.department+'</td><td>';
						
							if(mem.status=="00"){htmls+='<span class="teamstatus1">已通过</span></td>'}
							else if(mem.status=="01"){htmls+='<span class="teamstatus2">待审核	</span></td>'}
							else if(mem.status=="03"){htmls+='<span class="teamstatus3">已拒绝</span></td>'}
							else if(mem.status=="02"){htmls+='<span class="teamstatus3">已禁用</span></td>'}

						
						/*if(mem.status!="01"){
							htmls+='<td><a class="passBtn2">通过</a><a class="refuseBtn2">拒绝</a></td>'
						}else{
							htmls+='<td uid="'+mem.uid+'"><a flg="00" class="passBtn1" onclick="alertConfirm(\'2\',\'确定审批通过该用户？\','
								+'\'submitResult()\',this)">通过</a>'
							+'<a flg="03" class="refuseBtn1" onclick="alertConfirm(\'2\',\'确定审批拒绝该用户？\','
							+'\'submitResult()\',this)">拒绝</a>'
						}*/
						htmls+='<td>'
								+'<a uid="'+mem.uid+'" class="delete" '
								+'onclick="alertConfirm(\'2\',\'确定删除该用户吗？\',\'delUser()\',this)">删除</a>'
		    					+'<span class="split">|</span>'
		    					+'<a class="modify" detail=\''+JSON.stringify(mem)+'\' onclick="editUser(this)">修改</a>'
		    			/*		+'<span class="split">|</span>';
						if(mem.status=="00"){
							htmls+='<a uid="'+mem.uid+'" class="forbid1" '
							+'onclick="alertConfirm(\'2\',\'确定禁用该用户吗？\',\'forbidUser()\',this)">禁用</a>'
						}else{
							htmls+='<a class="forbid2">禁用</a>'
						}*/
		    			htmls+='</td></tr>'
								
					})
					$("tbody").append(htmls)
				} else if(data.status==1){
					alertMsg("2",data.errmsg,"fail")
				}
			},
			"error" : function(data) {
				alertMsg("2","后台获取数据出错！","fail")
			},
			beforeSend : null, // [Function]:请求之前回调函数（同jQuery）
			complete : null, // [Function]:请求完成回调函数（同jQuery）
			pageIndexName : 'pageIndex', // (已过时）[String]:自定义请求参数的当前页名称
			pageSizeName : 'iDisplayLength', // (已过时）[String]:自定义请求参数的每页数量名称
			totalName : 'iTotalRecords', // [String]:自定义返回的总页数名称，对象属性可写成'data.total'
			traditional : false
			// [Boolean]:参数序列化方式（同jQuery）
		},
	});
}

function submitResult(){
	closeWin();
	var flg=$(tempobj).attr("flg");
	var uid=$(tempobj).parent().attr("uid")
	$.ajax({
		type: "GET",
        url: "../updateLoginUser",
        dataType: "JSON",
        async:false,
        data: {
        	
        	"uid":uid,
        	
        	"status":flg,
        	},
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","审批成功！","success")
        		setTimeout('location.reload()',2000)
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function editUser(obj){
	temp=obj;
	var info=JSON.parse($(obj).attr("detail"))
	var htmls="";
	picurl=info.picurl;
	htmls+='<div class="cover2"></div><div id="addAdminbox">'
   			+'<img class="closeWin" src="../images/guanbi.png" onclick="closeInfoWin()">'
   			+'<h1 class="wTitle">修改用户信息</h1><div class="infobox">'
   			+'<ul class="infoboxul"><li><span class="leftspan">姓名</span>'
   			+'<input type="text" class="infoinput" id="uname" value="'+info.uname+'"></li>'
   			+'<li><span class="leftspan">电话</span>'
   			+'<input type="text" class="infoinput" id="phone" value="'+info.phone+'"></li>'
   			+'<li><span class="leftspan">学校/供职单位</span>'
   			+'<input type="text" class="infoinput" id="school" value="'+info.school+'"></li></ul>'
   			+'<ul class="infoboxul"><li id="sex"><span>性别</span>'
   			if(info.sex=="01"){
   				htmls+='<input type="radio" value="01" name="gender" checked style="vertical-align:sub;margin-left:10px;">男'
   		   			+'<input type="radio" value="02" name="gender" style="vertical-align:sub;margin-left:10px;">女'
   			}else{
   				htmls+='<input type="radio" value="01" name="gender" style="vertical-align:sub;margin-left:10px;">男'
   		   			+'<input type="radio" value="02" name="gender" style="vertical-align:sub;margin-left:10px;" checked>女'
   			}
   			
	htmls+='</li>'
   			+'<li><span>院系</span><input type="text" class="infoinput" id="department" value="'+info.department+'"></li>'
   			+'</ul><div class="iconwrap">'
   			+'<span id="zhaopian">照片</span><form id="myform" enctype="multipart/form-data" method="post">'
			+'<img src="'+info.picurl+'" id="portrait" >'
			+'<input type="file" class="imgfile" id="file" name="files" onchange="uploadImg()"><input hidden name="savetype" value="00"></form>'
			+'<p>413*626px,不超过1000kb</p></div></div><a class="ensure" onclick="editSaveInfo()">保存</a></div>'
	$("body").append(htmls);
}
function editSaveInfo(){
	
	var obj = temp
	var htmls="";
	var delflg=JSON.parse($(obj).attr("detail")).delflg;
	var uid=JSON.parse($(obj).attr("detail")).uid;
	var status=JSON.parse($(obj).attr("detail")).status;
	var uname=$("#uname").val();
	var school=$("#school").val();
	var sex=$("#sex").find("input:checked").val();
	var phone=$("#phone").val();
	var department=$("#department").val();
	if(uname.trim()==""){
		alertMsg("2","请填写姓名！","fail");
		return;
	}else if(uname.indexOf(",")!=-1){
		alertMsg("2","姓名不允许出现非法字符！","fail");
		return;
	}
	if(sex==""||sex==undefined){
		alertMsg("2","请选择性别！","fail");
		return;
	}
	if(phone.trim()==""){
		alertMsg("2","请填写手机号！","fail");
		return;
	}else{
		var reg=/^1[34578]\d{9}$/; 
		if(!reg.test(phone)){
			alertMsg("2","手机号格式不正确！","fail");
			return;
		}
	}
	var info={};
	info.uid=uid;
	info.delflg=delflg;
	info.uname=uname;
	info.school=school;
	info.sex=sex;
	info.phone=phone;
	info.status=status;
	info.delflg=delflg;
	info.picurl=picurl;
	info.uid=uid;
	
	$.ajax({
		type: "GET",
        url: "../updateLoginUser",
        dataType: "JSON",
        async:false,
        data: info,
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","修改成功！","success")
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function closeInfoWin(){
	$(".cover2").remove()
	$("#addAdminbox").remove()
}
function uploadImg(){
	var filetype=$("#file").val().slice($("#file").val().lastIndexOf(".")+1).toUpperCase()
	if (filetype == 'JPG'||filetype == 'PNG'||filetype == 'JPEG'){
		$("#myform").ajaxSubmit({
			url : "../uploadFiles",
			dataType : 'json',
			async : false,
			success : function(data) {
				if(data.status==0){
					readAsDataURL();
					picurl=data.urls;
				}else if(data.status==1){
					alertMsg("2",data.errmsg,"fail")
				}
			},
			error:function(){
				alertMsg("2","上传失败！","fail")
			}
	    })
	}else{
		alertMsg("2","文件格式不正确！","fail")
		return
	}
  
}

//图片预览
function readAsDataURL(){
  var simpleFile = document.getElementById("file").files[0];
  var reader = new FileReader();
  // 将文件以Data URL形式进行读入页面
  reader.readAsDataURL(simpleFile);
  reader.onload = function(e){
      $("#portrait").attr("src",this.result);
  }
}

function forbidUser(obj){
	closeWin();
	var uid=$(tempobj).attr("uid");
	$.ajax({
		type: "GET",
        url: "../updateLoginUser",
        dataType: "JSON",
        async:false,
        data: {
        	"uid":uid,
        	"status":"02"
        },
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","禁用成功！","success")
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function delUser(){
	closeWin();
	var uid=$(tempobj).attr("uid");
	$.ajax({
		type: "GET",
        url: "../updateLoginUser",
        dataType: "JSON",
        async:false,
        data: {
        	"uid":uid,
        	"delflg":"01"
        },
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","删除成功！","success")
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}
function clearSearch(){
	$(".searchul input").each(function(){
		$(this).val("");
		if($(this).attr("altvalue")!=null){
			$(this).attr("altvalue","")
		}
	})
}

function hasChecked(flg,obj){
	var text=$(obj).text();
	if($("input:checked").length==0){
		alertMsg("2","请选择用户！","fail");
		return;
	}
	alertConfirm('2','确定'+text+'该用户吗？','approveUser(\''+flg+'\')')
}

function approveUser(flg){
	closeWin();
	var uid=[];
	if(flg=="00"){
		$("input:checked").each(function(){
			if($(this).parent().attr("status")=="01"||$(this).parent().attr("status")=="02"){
				uid.push($(this).parent().attr("uid"))
			}
		})
	}
	if(flg=="02"){
		$("input:checked").each(function(){
			if($(this).parent().attr("status")=="00"){
				uid.push($(this).parent().attr("uid"))
			}
		})
	}
	if(flg=="03"){
		$("input:checked").each(function(){
			if($(this).parent().attr("status")=="01"){
				uid.push($(this).parent().attr("uid"))
			}
		})
	}
	$.ajax({
		type: "GET",
        url: "../uodateRegisteredUserBatch",
        dataType: "JSON",
        async:false,
        data: {
        	"struid":uid.join(","),
        	"status":flg
        },
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","操作成功！","success")
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function getDefault(){
	$.ajax({
		type: "GET",
        url: "../getdefaultUserStatusByRedis",
        dataType: "JSON",
        async:false,
        data: {
        	
        },
        success: function(data){
        	if(data.status == 0){
        		defaultstatus=data.info;
        		$("#defaultUserStatus").attr("altvalue",data.info)
        		if(data.info=="00"){
        			$("#defaultUserStatus").val("已通过")
        		}else if(data.info=="01"){
        			$("#defaultUserStatus").val("待审核")
        		}
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}

function setDefaultStatus(obj){
	var defaultUserStatus=$(obj).attr("altvalue");
	$("#defaultUserStatus").val($(obj).text());
	$("#defaultUserStatus").attr("altvalue",defaultUserStatus);
	$.ajax({
		type: "GET",
        url: "../updatedefaultUserStatusByRedis",
        dataType: "JSON",
        async:false,
        data: {
        	"defaultUserStatus":defaultUserStatus,
        },
        success: function(data){
        	if(data.status == 0){
        		alertMsg("2","操作成功！","success");
        		setTimeout('location.reload()',2000);
        	}else if(data.status == 1){
        		alertMsg("2",data.errmsg,"fail")
        	}
        },
	})
}