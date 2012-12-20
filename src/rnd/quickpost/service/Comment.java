package rnd.quickpost.service;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;
import redis.clients.jedis.Jedis;

@SuppressWarnings("serial")
public class Comment extends HttpServlet {
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Jedis jedis = new Jedis("localhost");
		JSONObject json = new JSONObject();

		String id = request.getParameter("id");
		String comment = request.getParameter("comment");

		// generating the hashkey for persisting a post in redis
		String hashkey = "qp:comment:" + id;
		
		String pattern = "@\\[(\\d+):((\\w+\\s*)+)\\]";
		comment = comment.replaceAll(pattern, "<a class=\"profile-link\" href=\"path/to/profile?id=$1\">$2</a>");
		System.out.println("key >>> " + hashkey);
		System.out.println("post >>> " + comment);
		
		// persist the hash at the generated hashkey
		jedis.rpush(hashkey, comment);
		json.put("comment", comment);

		// send the json object as a response to the request
		response.setContentType("application/json");
		PrintWriter out = response.getWriter();
		System.out.println("json >>> " + json.toString(4));
		out.println(json.toString());
		out.close();
	}
}
