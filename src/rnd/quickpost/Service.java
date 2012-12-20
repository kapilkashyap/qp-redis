package rnd.quickpost;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import redis.clients.jedis.Jedis;


public class Service {
	private static Jedis jedis;

	public static void main(String args[]) {
		jedis = new Jedis("localhost");
		Service service = new Service();
		
		service.patternRecognition();
		System.out.println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
		service.fetchImplementation();
		System.out.println("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
		service.explore();
	}

	private void explore() {
		JSONObject json = new JSONObject();
		json.put("id", "100");
		json.put("name", "kapil kashyap");
		json.put("email", "kapil.kashyaps@gmail.com");
		jedis.set("user:details", json.toString());
		System.out.println(">>> " + new JSONObject(jedis.get("user:details")));
	}
	
	private void fetchImplementation() {
		JSONArray parentJson = new JSONArray();
		Set<String> keys = jedis.keys("qp:post*");
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
		System.out.println("\nArray of json objects >>>");
		System.out.println(parentJson.toString(4));
	}

	private void patternRecognition() {
		String post = "@[1234567890:Sachin R Tendulkar]";
		String pattern = "@\\[(\\d+):((\\w+\\s*)+)\\]";
		System.out.println("Original post >>> " + post);
		post = post.replaceAll(pattern, "<a href=\"path/to/profile/$1\">$2</a>");
		System.out.println("After pattern replacement >>> " + post);
	}
}
