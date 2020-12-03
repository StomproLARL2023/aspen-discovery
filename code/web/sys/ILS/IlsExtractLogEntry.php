<?php

require_once ROOT_DIR . '/sys/BaseLogEntry.php';

class IlsExtractLogEntry extends BaseLogEntry
{
	public $__table = 'ils_extract_log';   // table name
	public $id;
	public $indexingProfile;
	public $lastUpdate;
	public $notes;
	public $numProducts;
	public $numErrors;
	public $numAdded;
	public $numDeleted;
	public $numUpdated;
	public $numSkipped;

}
