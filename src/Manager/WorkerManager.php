<?php

namespace AppBundle\Manager;

use AppBundle\Document\Repository\WorkerRepository;

class WorkerManager
{
    /**
     * @var WorkerRepository
     */
    protected $workerRepository;

    /**
     * @param WorkerRepository $workerRepository
     */
    public function __construct(WorkerRepository $workerRepository)
    {
        $this->workerRepository = $workerRepository;
    }

    public function registerWorker($ip)
    {
        return $this->workerRepository->registerWorker($ip);
    }

    public function unregisterWorker($ip)
    {
        return $this->workerRepository->unregisterWorker($ip);
    }
}
