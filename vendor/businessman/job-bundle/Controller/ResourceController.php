<?php
namespace BusinessMan\Bundle\JobBundle\Controller;

use BusinessMan\Bundle\JobBundle\Entity\Assignment;
use BusinessMan\Bundle\JobBundle\Form\Type\AddResourceType;
use Computech\Bundle\CommonBundle\Type\NotesEntry;
use Scheduler\Bundle\CommonBundle\Entity\Resource;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use BusinessMan\Bundle\JobBundle\Entity\Job;
use Symfony\Component\HttpFoundation\Request;

/**
 * ResourceController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ResourceController extends Controller
{
    /**
     * Remove a resource from a job
     *
     * @param Job      $job
     * @param Resource $resource
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function removeAction(Job $job, Resource $resource)
    {
        $em = $this->getDoctrine()->getManager();

        foreach ($job->getAssignments() as $assignment) {
            if ($assignment->getResource()->getId() == $resource->getId()) {
                $em->remove($assignment);
            }
        }

        $job->addNotes(
            new NotesEntry(
                $this->getUser()->getStaff()->getDisplayName(),
                sprintf('Removed resource %s (%s)', $resource->getName(), $resource->getCategory()->getName())
            )
        );

        $em->flush();

        return $this->redirect($this->generateUrl('jobs_view', array('job' => $job->getId())) . '#resources');
    }

    /**
     * Add a resource to a job
     *
     * @param Job     $job
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function addAction(Job $job, Request $request)
    {
        $assignment = new Assignment();
        $assignment->setJob($job);

        $form = $this->createForm(new AddResourceType(), $assignment);
        $form->handleRequest($request);

        if ($form->isValid()) {
            $job->addNotes(
                new NotesEntry(
                    $this->getUser()->getStaff()->getDisplayName(),
                    sprintf(
                        'Removed resource %s (%s)',
                        $assignment->getResource()->getName(),
                        $assignment->getResource()->getCategory()->getName()
                    )
                )
            );

            $em = $this->getDoctrine()->getManager();
            $em->persist($assignment);
            $em->persist($job);
            $em->flush();

            return $this->redirect($this->generateUrl('jobs_view', array('job' => $job->getId())) . '#resources');
        }

        return $this->render(
            '@BusinessManJob/Resource/add.html.twig',
            array('form' => $form->createView(), 'job' => $job)
        );
    }

    /**
     * Add a resource to a job
     *
     * @param Job      $job
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function addSelfAction(Job $job)
    {
        foreach ($job->getAssignments() as $assignment) {
            if ($assignment->getResource()->getId() == $this->getUser()->getStaff()->getResource()->getId()) {
                throw new \InvalidArgumentException(
                    sprintf('You are already part of job %s', $job->getId())
                );
            }
        }

        $resource = $this->getUser()->getStaff()->getResource();

        $assignment = new Assignment();
        $assignment->setJob($job);
        $assignment->setResource($resource);

        $job->addNotes(
            new NotesEntry(
                $this->getUser()->getStaff()->getDisplayName(),
                sprintf('Added resource %s (%s)', $resource->getName(), $resource->getCategory()->getName())
            )
        );

        $em = $this->getDoctrine()->getManager();
        $em->persist($assignment);
        $em->flush();

        return $this->redirect($this->generateUrl('jobs_view', array('job' => $job->getId())) . '#resources');
    }
}
