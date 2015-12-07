package spring.hashcul.model;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="ListInfo")
public class ListInfoVo {
	
	String id;
	String title;
	String category;
	String location;
	int startdate;
	int enddate;
	
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public int getStartdate() {
		return startdate;
	}
	public void setStartdate(int startdate) {
		this.startdate = startdate;
	}
	public int getEnddate() {
		return enddate;
	}
	public void setEnddate(int enddate) {
		this.enddate = enddate;
	}

	
	

}
