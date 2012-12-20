package rnd.quickpost.service;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import redis.clients.jedis.Jedis;

@SuppressWarnings("serial")
public class Fetch extends HttpServlet {
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Jedis jedis = new Jedis("localhost");
		JSONArray parentJson = new JSONArray();
		
		String pattern = request.getParameter("pattern");
		Set<String> keys = jedis.keys(pattern);
		List<String> keylist = new ArrayList<String>(keys);
		// sorting the keylist would put them in an ascending order.
		Collections.sort(keylist);
		// because we need the posts in descending order, we reverse the sorted keylist.
		Collections.reverse(keylist);
		for(String key : keylist) {
			JSONObject json = new JSONObject();
			String[] split = key.split(":");
			String id = split[split.length - 1];
			String post = jedis.hget(key, "post");
			
			json.put("id", id);
			json.put("post", post);
			json.put("comments", jedis.lrange("qp:comment:" + id, 0, -1));
			parentJson.put(json);
		}
		
		// send the json object as a response to the request
		response.setContentType("application/json");
		PrintWriter out = response.getWriter();
		System.out.println(parentJson.toString(4));
		out.println(parentJson.toString());
		out.close();
	}
}
