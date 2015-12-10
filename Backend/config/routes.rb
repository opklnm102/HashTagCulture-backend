Rails.application.routes.draw do
    
    root 'sessions#new'
    
    get 'lists' => 'lists#get_all_lists'
    get 'lists/search' => 'lists#get_search_lists'
end