Rails.application.routes.draw do
    
    root 'sessions#new'
    
    get 'performances' => 'performances#get_all_lists'
    get 'performances/recommend' => 'performances#get_recommend_lists'
    get 'performances/detail' => 'performances#get_list'
    get 'performances/detail/:listid' => 'performances#get_list'
    get 'performances/chat' => 'performances#chat'
    
    get 'exhibits' => 'exhibits#get_all_lists'
    get 'exhibits/recommend' => 'exhibits#get_recommend_lists'
    get 'exhibits/detail' => 'exhibits#get_list'
    get 'exhibits/detail/:listid' => 'exhibits#get_list'
    get 'exhibits/chat' => 'exhibits#chat'


end