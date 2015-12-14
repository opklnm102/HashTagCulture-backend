# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151213063304) do

  create_table "lists", id: false, force: :cascade do |t|
    t.integer  "listid"
    t.integer  "seq"
    t.string   "title"
    t.datetime "startdate"
    t.datetime "enddate"
    t.string   "place"
    t.string   "category"
    t.string   "area"
    t.string   "price"
    t.string   "homepage"
    t.string   "phone"
    t.string   "mainposterurl"
    t.string   "detailposterurl"
    t.integer  "gpsx"
    t.integer  "gpsy"
    t.string   "placeurl"
    t.string   "placeaddr"
    t.integer  "placeseq"
  end

end
