<?php
namespace BusinessMan\Bundle\StaffBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * StaffController
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/StaffBundle
 */
class StaffController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     *
     * @Security("has_role('ROLE_STAFF')")
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'BusinessManStaffBundle:Staff';
    }

    /**
     * {@inheritDoc}
     */
    protected function applyFilter($qb, $field, $filter, $global = false)
    {
        if ($field == 'category') {
            $qb->innerJoin('e.resource', 'r');
            $qb->andWhere('r.category = :category');
            $qb->setParameter('category', (int) $filter);

            return;
        }
    }
}
