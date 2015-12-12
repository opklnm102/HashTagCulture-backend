package com.ipocs.hashtagculture.utils;

import java.io.IOException;
import java.util.ArrayList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.jsoup.Jsoup;
import org.jsoup.select.Elements;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import com.ipocs.hashtagculture.dto.CultureInfo;

public class CultureXmlParser {

	public static final String TAG = CultureXmlParser.class.getSimpleName();

	/***
	 * 문화포털 open api 사용자 정보
	 */
	private String endPoint = "http://www.culture.go.kr/openapi/rest";
	private String SERVICEKEY = "serviceKey";
	private String serviceKeyValue = "YC6tdD5H%2BZoOY3ClTAIoLJwtARfqddhqxxKnAyiY3a3kXU12MdVKahh%2BAm9M7ARRMD05r8pxV9zpfPeySmCqbg%3D%3D";

	/***
	 * 공연,전시 정보 조회 open api
	 */
	private String apiPerformance = "publicperformancedisplays";

	// 기간별 조회
	// endPoint + period + from + to + cPage + rows + sortStdr + serviceKey
	private String PERIOD = "period"; // 기간별 조회
	private String FROM = "from"; // 시작기간 20151122
	private String TO = "to"; // 종료기간 20161231
	private String CPAGE = "cPage"; // 현재페이지 1
	private String ROWS = "rows"; // 페이지당 row수 1000
	private String SORTSTDR = "sortStdr"; // 정렬기준 1(등록일), 2(공연명), 3(지역)

	// 상세정보 조회
	// endPoint + detail + seq + serviceKey
	private String DETAIL = "d"; // 상세정보 조회
	private String SEQ = "seq"; // 조회할 정보의 시퀀스번호

	private static CultureXmlParser instance;
	private SAXParser parser;
	private DocumentBuilder documentBuilder;

	public static CultureXmlParser getInstance() {
		synchronized (CultureXmlParser.class) {
			if (instance == null) {
				instance = new CultureXmlParser();
			}
			return instance;
		}
	}

	private ArrayList<CultureInfo> list;

	public ArrayList<CultureInfo> getParsedData() {
		return this.list;
	}

	private CultureXmlParser() {

		try {
			parser = SAXParserFactory.newInstance().newSAXParser();
			documentBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// 기간별공연 전시목록 조회
	public ArrayList<CultureInfo> getPerformanceList(String from, String to) {

		String url = endPoint + "/" + apiPerformance + "/" + PERIOD + "?" + FROM + "=" + from + "&" + TO + "=" + to
				+ "&" + CPAGE + "=1" + "&" + ROWS + "=3" + "&" + SORTSTDR + "=1" + "&" + SERVICEKEY + "="
				+ serviceKeyValue;

		System.out.println(url);

		PerformancePeriodListHandler performanceHandler = new PerformancePeriodListHandler();

		try {
			parser.parse(url, performanceHandler);
		} catch (SAXException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

		list = performanceHandler.getParsedData();

		return list;
	}

	// 공연,전시 상세정보 조회
	public CultureInfo getPerformanceDetail(CultureInfo item) {

		String seq = null;

		if (item != null) {
			seq = item.getSeq().toString();
		} else {
			return null;
		}

		if (seq != null) {

			String url = endPoint + "/" + apiPerformance + "/" + DETAIL + "/?" + SEQ + "=" + seq + "&" + SERVICEKEY
					+ "=" + serviceKeyValue;

			System.out.println(url);

			try {

				Document document = documentBuilder.parse(url);

				// Root엘리먼트 획득(response 태그)
				Element rootElement = document.getDocumentElement();
				System.out.println(" " + rootElement);

				// Root엘리먼트의 자식 노드 목록 획득(comMsgHeader, msgBody 태그)
				NodeList rootNodeList = rootElement.getChildNodes();

				// 자식노드가 1개 이상일 경우
				if (rootNodeList.getLength() > 0) {

					// msgBody 노드 추출
					Node msgBodyNode = rootElement.getElementsByTagName("msgBody").item(0);

					System.out.println(" " + msgBodyNode);

					NodeList nodeList = msgBodyNode.getChildNodes();

					for (int i = 0; i < nodeList.getLength(); i++) {
						System.out.println(nodeList.item(i));

						// perforInfo 노드 추출
						if (nodeList.item(i).getNodeName().equals("perforInfo")) {
							NodeList nodeList2 = nodeList.item(i).getChildNodes();

							item = new CultureInfo();

							// 상세정보 추출
							for (int j = 0; j < nodeList2.getLength(); j++) {
								System.out.println(nodeList2.item(j));
								if (nodeList2.item(j).getNodeName().equals("title")) {
									item.setTitle(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("startDate")) {
									item.setStartDate(TimeUtils.stringDayToDate(nodeList2.item(j).getTextContent()));
								} else if (nodeList2.item(j).getNodeName().equals("endDate")) {
									item.setEndDate(TimeUtils.stringDayToDate(nodeList2.item(j).getTextContent()));
								} else if (nodeList2.item(j).getNodeName().equals("place")) {
									item.setPlace(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("realmName")) {
									item.setCategory(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("area")) {
									item.setArea(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("price")) {
									item.setPrice(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("url")) {
									item.setHomepage(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("phone")) {
									item.setPhone(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("imgUrl")) {
									item.setMainPosterUrl(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("gpsX")) {
									item.setGpsX(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("gpsY")) {
									item.setGpsY(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("placeUrl")) {
									item.setPlaceUrl(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("placeAddr")) {
									item.setPlaceAddr(nodeList2.item(j).getTextContent());
								} else if (nodeList2.item(j).getNodeName().equals("placeSeq")) {
									item.setPlaceSeq(Long.parseLong(nodeList2.item(j).getTextContent()));
								} else if (nodeList2.item(j).getNodeName().equals("contents1")) {
									NodeList nodeList3 = nodeList2.item(j).getChildNodes();

									for (int k = 0; k < nodeList3.getLength(); k++) { // DetailPoster
																						// img는
																						// 여러개지만
																						// 그중
																						// 첫번째꺼만
																						// 가져온다.
										String str = nodeList3.item(k).getTextContent();

										org.jsoup.nodes.Document doc = Jsoup.parse(str);

										Elements ele = doc.select("img");

										item.setDetailPosterUrl(ele.attr("src"));

										// for(org.jsoup.nodes.Element e :
										// doc.select("img")){
										// System.out.println(e.attr("src"));
										// }
									}
								}
							}
						}
					}
				}
			} catch (SAXException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		return item;
	}

	// 기간별공연 전시목록 조회 SAX파서 핸들러
	class PerformancePeriodListHandler extends DefaultHandler {

		private String postion = "";
		private CultureInfo item;

		private ArrayList<CultureInfo> list;

		public ArrayList<CultureInfo> getParsedData() {
			return this.list;
		}

		@Override
		public void startDocument() throws SAXException {
			super.startDocument();
			System.out.println("startDocument");

			list = new ArrayList<CultureInfo>();
		}

		@Override
		public void endDocument() throws SAXException {
			super.endDocument();
			System.out.println("endDocument");
		}

		// <seq>102621</seq>
		// <title>뮤지컬 비밥(Bibap)</title>
		// <startDate>20140201</startDate>
		// <endDate>20151231</endDate>
		// <place>종로 시네코아</place>
		// <realmName>연극</realmName>
		// <area>서울</area>
		// <thumbnail>
		// http://ticketimage.interpark.com/Play/image/large/14/14000223_p.gif
		// </thumbnail>
		// <gpsX>126.98811467140081</gpsX>
		// <gpsY>37.5688311510054</gpsY>

		@Override
		public void startElement(String uri, String localName, String qName, Attributes attributes)
				throws SAXException {

			System.out.println("startElement " + qName);

			if ("perforList".equals(qName)) {
				item = new CultureInfo();
			} else if ("seq".equals(qName)) {
				postion = "seq";
			}
		}

		@Override
		public void endElement(String uri, String localName, String qName) throws SAXException {
			System.out.println("endElement " + qName);

			if (item != null) {
				list.add(item);
				item = null;
			}
		}

		@Override
		public void characters(char[] ch, int start, int length) throws SAXException {
			System.out.println("characters");

			if ("seq".equals(postion)) {
				item.setSeq((Long.parseLong((new String(ch, start, length).trim()))));
			}
			postion = "";
		}
	}
}