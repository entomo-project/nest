<?php

namespace AppBundle\Manager;

use AppBundle\Document\Repository\JobRepository;

class JobManager
{
    /**
     * @var JobRepository
     */
    protected $jobRepository;

    /**
     * @var WorkerManager
     */
    protected $workerManager;

    /**
     * @param JobRepository $jobRepository
     * @param WorkerManager $workerManager
     */
    public function __construct(
        JobRepository $jobRepository,
        WorkerManager $workerManager
    ) {
        $this->jobRepository = $jobRepository;
        $this->workerManager = $workerManager;
    }

    /**
     * @param string $id
     */
    public function retrieveJob($id)
    {
        $result = $this->jobRepository->findOneNoHydrate($id);

        if ($result === null) {
            return [
                'status' => 'not_found',
            ];
        }

        $result['id'] = (string)$result['_id'];

        unset($result['_id']);

        return [
            'status' => 'success',
            'result' => $result,
        ];
    }

    public function submitJob($jobId)
    {
        $worker = $this->workerManager->getIdleWorker();

        var_dump($worker);
    }

    /**
     * @param bool $sync
     * @param string $name
     * @param array $parameters
     *
     * @return array
     */
    public function createJob($sync, $name, array $parameters)
    {
        $createJobResult = $this->jobRepository->createJob($name, $parameters);

        if ($sync) {
            $this->submitJob($createJobResult['result']['id']);
        }

        return $createJobResult;
    }
}