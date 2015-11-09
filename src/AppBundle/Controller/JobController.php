<?php

namespace AppBundle\Controller;

use AppBundle\Manager\JobManager;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class JobController extends Controller
{
    public function retrieveAction()
    {
        return new JsonResponse(
            [
                'status' => 'success',
            ]
        );
    }

    /**
     * @param Request $request
     *
     * @return JsonResponse
     */
    public function createAction(Request $request)
    {
        $job = $request->request->get('name');
        $parameters = $request->request->get('parameters');

        $result = $this->getJobManager()->createJob($job, $parameters);

        if (isset($result['result']['id'])) {
            $result['result']['id'] = (string)$result['result']['id'];
        }

        return new JsonResponse($result);
    }

    public function abortAction()
    {
        return new JsonResponse(
            [
                'status' => 'success',
            ]
        );
    }

    /**
     * @return JobManager
     */
    protected function getJobManager()
    {
        return $this->get('app.manager.job');
    }
}
