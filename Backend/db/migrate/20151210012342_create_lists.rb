class CreateLists < ActiveRecord::Migration
  def change
      create_table :lists do |t|
          t.string  :listid
          t.string  :title
          t.string  :category
          t.integer :startDate
          t.integer :endDate
    end
  end
end
