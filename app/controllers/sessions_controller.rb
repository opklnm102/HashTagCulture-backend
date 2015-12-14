class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(uid: params[:session][:uid].downcase)
    if user && user.authenticate(params[:session][:password])
      # Log the user in and redir1ect to the user's show page.      
      session[:user_id] = user.id
      redirect_to reservations_path
    else
      # Create an error message.
      render 'new'
    end
  end

  def destroy
    # log_out
    session.delete(:user_id)
    redirect_to root_path
  end
  
end
