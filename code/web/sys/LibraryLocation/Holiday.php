<?php

require_once ROOT_DIR . '/sys/DB/DataObject.php';
class Holiday extends DataObject
{
	public $__table = 'holiday';   // table name
	public $id;                    // int(11)  not_null primary_key auto_increment
	public $libraryId;             // int(11)
	public $date;                  // date
	public $name;                  // varchar(100)


	static function getObjectStructure(){
		$library = new Library();
		$library->orderBy('displayName');
		$library->find();
		$libraryList = array();
		while ($library->fetch()){
			$libraryList[$library->libraryId] = $library->displayName;
		}
		
		$structure = array(
			'id' => array('property'=>'id', 'type'=>'label', 'label'=>'Id', 'description'=>'The unique id of the holiday within the database'),
			'libraryId' => array('property'=>'libraryId', 'type'=>'enum', 'values'=>$libraryList, 'label'=>'Library', 'description'=>'A link to the library'),
			'date' => array('property'=>'date', 'type'=>'date', 'label'=>'Date', 'description'=>'The date of a holiday.', 'required'=>true),
			'name' => array('property'=>'name', 'type'=>'text', 'label'=>'Holiday Name', 'description'=>'The name of a holiday')
		);
		return $structure;
	}
}