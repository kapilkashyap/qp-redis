package rnd.quickpost.service;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;
import redis.clients.jedis.Jedis;

@SuppressWarnings("serial")
public class Post extends HttpServlet {
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Jedis jedis = new Jedis("localhost");
		Map<String, String> hash = new HashMap<String, String>();
		JSONObject json = new JSONObject();

		String post = request.getParameter("post");

		// generating a uniqueId using the timestamp
		String uniqueid = String.valueOf(new Date().getTime());
		// generating the hashkey for persisting a post in redis
		String hashkey = "qp:post:" + uniqueid;
		
		String pattern = "@\\[(\\d+):((\\w+\\s*)+)\\]";
		post = post.replaceAll(pattern, "<a class=\"profile-link\" href=\"path/to/profile?id=$1\">$2</a>");
		System.out.println("key >>> " + hashkey);
		System.out.println("post >>> " + post);
		
		// create a hash for redis and a json object for the response
		hash.put("id", uniqueid);
		hash.put("post", post);
//		jedis.lpush(hashkey, post);
		
		// persist the hash at the generated hashkey
		jedis.hmset(hashkey, hash);
		json.put("resp", hash);

		// send the json object as a response to the request
		response.setContentType("application/json");
		PrintWriter out = response.getWriter();
		System.out.println("json >>> " + json.toString(4));
		out.println(json.toString());
		out.close();
	}
}
