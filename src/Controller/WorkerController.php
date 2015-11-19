<?php

namespace AppBundle\Controller;

use AppBundle\Manager\WorkerManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class WorkerController extends Controller
{
    public function registerAction($ip)
    {
        $result = $this->getWorkerManager()->registerWorker($ip);

        if ($result['status'] === 'not_found') {
            return new JsonResponse($result, JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse($result);
    }

    public function unregisterAction($ip)
    {
        $result = $this->getWorkerManager()->unregisterWorker($ip);

        if ($result['status'] === 'not_found') {
            return new JsonResponse($result, JsonResponse::HTTP_NOT_FOUND);
        }

        return new JsonResponse($result);
    }

    /**
     * @return WorkerManager
     */
    protected function getWorkerManager()
    {
        return $this->get('app.manager.worker');
    }
}
