class ListsController < ApplicationController
  def index
  end

def get_all_lists
    @responses = []
    lists = List.all.order([:enddate])
    
    lists.each do |list|
        response = {
            id: list.listid,
            title: list.title,
            category: list.category,
            startDate: list.startDate,
            end_time: list.endDate,
        }
        @responses << response
    end
    render json: @responses
end


def show
end
    
def get_search_lists
    @responses = []
    #lists = List.where(category: params[:categories]).where('startDate <= ?', params[:startDate]).where('endDate >= ?', params[:endDate])
    lists = List.where(category: params[:categories]).where("startdate >= :startdate AND enddate <= :enddate", startdate: params[:startdate], enddate: params[:enddate]).order([:enddate])
    
    lists.each do |list|
        response = {
            id: list.listid,
            title: list.title,
            category: list.category,
            startDate: list.startDate,
            end_time: list.endDate,
        }
        @responses << response
    end

render json: @responses
end

  private
  def list_params
      params.require(:list).permit(:listid, :title, :category, :location, :startdate, :enddate)
  end
end
