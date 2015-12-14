class CreateLists < ActiveRecord::Migration
  def change
      create_table :lists, id: false do |t|
          t.integer :listid, primary: true
          t.integer :seq
          t.string :title
          t.datetime :startdate
          t.datetime :enddate
          t.string :place
          t.string :category
          t.string :area
          t.string :price
          t.string :homepage
          t.string :phone
          t.string :mainposterurl
          t.string :detailposterurl
          t.integer :gpsx
          t.integer :gpsy
          t.string :placeurl
          t.string :placeaddr
          t.integer :placeseq
    end
  end
end
