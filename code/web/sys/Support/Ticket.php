<?php

class Ticket extends DataObject {
	public $__table = 'ticket';
	public $id;
	public $ticketId;
	public $displayUrl;
	public $title;
	public $description;
	public $dateCreated;
	public $requestingPartner;
	public $status;
	public $queue;
	public $severity;
	public $component;
	public $partnerPriority;
	public $partnerPriorityChangeDate;
	public $dateClosed;

	public $_relatedTasks;

	public function getNumericColumnNames(): array {
		return [
			'requestingPartner',
			'dateCreated',
			'partnerPriority',
			'partnerPriorityChangeDate',
			'dateClosed',
			'developmentTaskId'
		];
	}

	public static function getObjectStructure(): array {
		//Get a list of statuses
		require_once ROOT_DIR . '/sys/Support/TicketStatusFeed.php';
		$ticketStatusFeed = new TicketStatusFeed();
		$ticketStatuses = $ticketStatusFeed->fetchAll('name');
		$ticketStatuses['Closed'] = 'Closed';
		ksort($ticketStatuses);

		require_once ROOT_DIR . '/sys/Support/TicketQueueFeed.php';
		$ticketQueueFeed = new TicketQueueFeed();
		$ticketQueues = $ticketQueueFeed->fetchAll('name');
		$ticketQueues[''] = 'None';
		ksort($ticketQueues);

		require_once ROOT_DIR . '/sys/Support/TicketSeverityFeed.php';
		$ticketSeverityFeed = new TicketSeverityFeed();
		$ticketSeverities = $ticketSeverityFeed->fetchAll('name');
		$ticketSeverities[''] = 'None';
		ksort($ticketSeverities);

		$partnerPriorities = [
			0 => 'None',
			1 => 'Priority 1',
			2 => 'Priority 2',
			3 => 'Priority 3'
		];

		require_once ROOT_DIR . '/sys/Greenhouse/AspenSite.php';
		$aspenSite = new AspenSite();
		$aspenSite->orderBy('name');
		$aspenSites = $aspenSite->fetchAll('id', 'name');
		$aspenSites[null] = 'None';

		require_once ROOT_DIR . '/sys/Development/TaskTicketLink.php';
		$taskTicketLinkStructure = TaskTicketLink::getObjectStructure();
		unset($taskTicketLinkStructure['ticketId']);

		return [
			'id' => array(
				'property' => 'id',
				'type' => 'label',
				'label' => 'Id',
				'description' => 'The unique id'
			),
			'ticketId' => array(
				'property' => 'ticketId',
				'type' => 'text',
				'label' => 'Ticket ID',
				'description' => 'The name of the Severity',
				'maxLength' => 20,
				'required' => true,
				'readOnly' => true
			),
			'displayUrl' => array(
				'property' => 'displayUrl',
				'type' => 'url',
				'label' => 'Display URL',
				'description' => 'The URL where the ticket can be found',
				'hideInLists' => true,
				'required' => true,
				'readOnly' => true
			),
			'title' => array(
				'property' => 'title',
				'type' => 'text',
				'label' => 'Title',
				'description' => 'The title for the ticket',
				'maxLength' => 512,
				'required' => true,
				'readOnly' => true
			),
			'description' => array(
				'property' => 'description',
				'type' => 'textarea',
				'label' => 'Description',
				'description' => 'The description for the ticket',
				'hideInLists' => true,
				'required' => true,
				'readOnly' => true
			),
			'dateCreated' => array(
				'property' => 'dateCreated',
				'type' => 'timestamp',
				'label' => 'Date Created',
				'description' => 'When the ticket was created',
				'required' => true,
				'readOnly' => true
			),
			'status' => array(
				'property' => 'status',
				'type' => 'enum',
				'values' => $ticketStatuses,
				'label' => 'Status',
				'description' => 'Status of the ticket',
				'required' => true,
				'readOnly' => true
			),
			'queue' => array(
				'property' => 'queue',
				'type' => 'enum',
				'values' => $ticketQueues,
				'label' => 'Queue',
				'description' => 'Queue of the ticket',
				'required' => true,
				'readOnly' => true
			),
			'severity' => array(
				'property' => 'severity',
				'type' => 'enum',
				'values' => $ticketSeverities,
				'label' => 'Severity',
				'description' => 'Severity of a bug',
				'required' => true,
				'readOnly' => true
			),
			'requestingPartner' => array(
				'property' => 'requestingPartner',
				'type' => 'enum',
				'values' => $aspenSites,
				'label' => 'Requesting Partner',
				'description' => 'The partner who entered the ticket',
				'required' => true,
				'readOnly' => true
			),
			'partnerPriority' => array(
				'property' => 'partnerPriority',
				'type' => 'enum',
				'values' => $partnerPriorities,
				'label' => 'Partner Priority',
				'description' => 'Priority for the partner',
				'required' => true,
				'readOnly' => true
			),
			'partnerPriorityChangeDate' => array(
				'property' => 'partnerPriorityChangeDate',
				'type' => 'timestamp',
				'label' => 'Partner Priority Last Changed',
				'description' => 'When the partner last changed the priority',
				'required' => true,
				'readOnly' => true
			),
			'dateClosed' => array(
				'property' => 'dateClosed',
				'type' => 'timestamp',
				'label' => 'Date Closed',
				'description' => 'When the ticket was closed',
				'required' => false,
				'readOnly' => true
			),
			'relatedTasks' => [
				'property' => 'relatedTasks',
				'type' => 'oneToMany',
				'label' => 'Related Tasks',
				'description' => 'A list of all tasks assigned to this ticket',
				'keyThis' => 'id',
				'keyOther' => 'ticketId',
				'subObjectType' => 'TaskTicketLink',
				'structure' => $taskTicketLinkStructure,
				'sortable' => false,
				'storeDb' => true,
				'allowEdit' => true,
				'canEdit' => true,
				'additionalOneToManyActions' => [],
				'hideInLists' => true
			],
		];
	}

	function getAdditionalObjectActions($existingObject): array {
		$objectActions = array();

		if ($existingObject instanceof Ticket) {
			require_once ROOT_DIR . '/sys/Support/RequestTrackerConnection.php';
			$rtConnection = new RequestTrackerConnection();
			if ($rtConnection->find(true)) {

				$objectActions[] = array(
					'text' => 'Open in RT',
					'url' => $rtConnection->baseUrl . '/Ticket/Display.html?id=' . $existingObject->ticketId,
					'target' => '_blank'
				);
			}
		}
		return $objectActions;
	}

	function getAdditionalListActions(): array {
		$objectActions = array();

		require_once ROOT_DIR . '/sys/Support/RequestTrackerConnection.php';
		$rtConnection = new RequestTrackerConnection();
		if ($rtConnection->find(true)) {

			$objectActions[] = array(
				'text' => 'Open in RT',
				'url' => $rtConnection->baseUrl . '/Ticket/Display.html?id=' . $this->ticketId,
				'target' => '_blank'
			);
		}
		return $objectActions;
	}

	public function __get($name) {
		if ($name == 'relatedTasks') {
			return $this->getRelatedTasks();
		} else {
			return $this->_data[$name];
		}
	}

	public function __set($name, $value) {
		if ($name == "relatedTasks") {
			$this->_relatedTasks = $value;
		} else {
			$this->_data[$name] = $value;
		}
	}

	/**
	 * @return int|bool
	 */
	public function update() {
		$ret = parent::update();
		if ($ret !== FALSE) {
			$this->saveRelatedTasks();
		}
		return $ret;
	}

	public function insert() {
		$ret = parent::insert();
		if ($ret !== FALSE) {
			$this->saveRelatedTasks();
		}
		return $ret;
	}

	public function saveRelatedTasks() {
		if (isset ($this->_relatedTasks) && is_array($this->_relatedTasks)) {
			$this->saveOneToManyOptions($this->_relatedTasks, 'ticketId');
			unset($this->_relatedTasks);
		}
	}

	/**
	 * @return TaskTicketLink[]
	 */
	private function getRelatedTasks(): ?array {
		if (!isset($this->_relatedTasks) && $this->id) {
			require_once ROOT_DIR . '/sys/Development/TaskTicketLink.php';
			$this->_relatedTasks = [];
			$task = new TaskTicketLink();
			$task->ticketId = $this->id;
			$task->find();
			while ($task->fetch()) {
				$this->_relatedTasks[$task->id] = clone($task);
			}
		}
		return $this->_relatedTasks;
	}
}