<?php

namespace AppBundle\Manager;

use AppBundle\Document\JobStatus;
use AppBundle\Document\Repository\JobRepository;
use AppBundle\Transport\JobTransportInterface;

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
     * @var JobTransportInterface
     */
    protected $jobTransport;

    /**
     * @param JobRepository $jobRepository
     * @param WorkerManager $workerManager
     * @param JobTransportInterface $jobTransport
     */
    public function __construct(
        JobRepository $jobRepository,
        WorkerManager $workerManager,
        JobTransportInterface $jobTransport
    ) {
        $this->jobRepository = $jobRepository;
        $this->workerManager = $workerManager;
        $this->jobTransport = $jobTransport;
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

    public function submitJob($jobId, $jobName, array $jobParameters)
    {
        $worker = $this->workerManager->getIdleWorker();

        $result = $this->jobTransport->submitJobToWorker(
            $worker['ip'],
            $jobId,
            $jobName,
            $jobParameters
        );

        if ($result['status'] === 'success') {
            $this->jobRepository->updateJob(
                $jobId,
                [
                    'result' => $result['result'],
                    'status' => JobStatus::JOB_STATUS_DONE,
                ]
            );
        }
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
            $this->submitJob(
                $createJobResult['result']['id'],
                $name,
                $parameters
            );
        }

        return $createJobResult;
    }
}