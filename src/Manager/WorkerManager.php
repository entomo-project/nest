<?php

namespace AppBundle\Manager;

use AppBundle\Document\Repository\JobRepository;
use AppBundle\Document\Repository\WorkerRepository;

class WorkerManager
{
    /**
     * @var WorkerRepository
     */
    protected $workerRepository;

    /**
     * @var JobRepository
     */
    protected $jobRepository;

    /**
     * @param WorkerRepository $workerRepository
     * @param JobRepository $jobRepository
     */
    public function __construct(
        WorkerRepository $workerRepository,
        JobRepository $jobRepository
    ) {
        $this->workerRepository = $workerRepository;
        $this->jobRepository = $jobRepository;
    }

    public function registerWorker($ip)
    {
        $this->jobRepository->unassignWorkerJobs($ip);

        return $this->workerRepository->registerWorker($ip);
    }

    public function unregisterWorker($ip)
    {
        $this->jobRepository->unassignWorkerJobs($ip);

        return $this->workerRepository->unregisterWorker($ip);
    }
}
