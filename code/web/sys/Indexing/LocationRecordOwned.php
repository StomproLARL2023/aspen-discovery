<?php

class LocationRecordOwned extends RecordOwned{
	public $__table = 'location_records_owned';    // table name
	public $locationId;

	static function getObjectStructure(){
		$location = new Location();
		$location->orderBy('displayName');
		if (!UserAccount::userHasPermission('Administer All Locations')){
			$homeLibrary = Library::getPatronHomeLibrary();
			$location->libraryId = $homeLibrary->libraryId;
		}
		$location->find();
		$locationList = array();
		while ($location->fetch()){
			$locationList[$location->locationId] = $location->displayName;
		}

		$structure = parent::getObjectStructure();
		$structure['locationId'] = array('property'=>'locationId', 'type'=>'enum', 'values'=>$locationList, 'label'=>'Location', 'description'=>'The id of a location');

		return $structure;
	}
}