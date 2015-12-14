class ExhibitsController < ApplicationController
  def index
  end

def get_all_lists
    @responses = []
    
    lists = List.where('category' => '미술').order(:enddate)
    
    lists.each do |list|
        response = {
            id: list.listid,
            title: list.title,
            mainposterurl: list.mainposterurl,
            startdate: list.startdate.to_time.to_i,
            enddate: list.enddate.to_time.to_i,
            category: list.category,
            area: list.area
        }
        @responses << response
    end
    
    render json: @responses
end

def get_list
    list = List.find(params[:listid])
        @response = {
            id: list.listid,
            seq: list.seq,
            title: list.title,
            startdate: list.startdate.to_time.to_i,
            enddate: list.enddate.to_time.to_i,
            place: list.place,
            category: list.category,
            area: list.area,
            price: list.price,
            homepage: list.homepage,
            phone: list.phone,
            mainposterurl: list.mainposterurl,
            detailposterurl: list.detailposterurl,
            gpsx: list.gpsx,
            gpsy: list.gpsy,
            placeurl: list.placeurl,
            placeaddr: list.placeaddr,
            placeseq: list.placeseq
        }
    render json: @response
end


def show
end
    
def get_recommend_lists
    @responses = []
    lists = List.where(category: params[:categories]).where(area:params[:locations]).where("startdate >= ?",Time.at(params[:startdate].to_i)).where("enddate <= ?",Time.at(params[:enddate].to_i)).order(:enddate);
    
    lists.each do |list|
        response = {
            id: list.listid,
            title: list.title,
            mainposterurl: list.mainposterurl,
            startdate: list.startdate.to_time.to_i,
            enddate: list.enddate.to_time.to_i,
            category: list.category,
            area: list.area
        }
        @responses << response
    end
render json: @responses
end


def chat
    
    
end


  private
  def list_params
      params.require(:lists).permit(:id, :listid, :title, :category, :area, :startdate, :enddate)
  end
end
