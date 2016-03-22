<?php
namespace BusinessMan\Bundle\JobBundle\Form\Type;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * TimesheetType
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class TimesheetType extends AbstractType
{
    /**
     * {@inheritDoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('dateFrom');
        $builder->add('timeFrom');
        $builder->add('timeTo');
        $builder->add('timeValue', null, array('required' => false));

        $builder->add(
            'staff', 'entity',
            array(
                'class' => 'BusinessManStaffBundle:Staff',
                'property' => 'displayName',
                'empty_value' => '',
                'query_builder' => function (EntityRepository $repository) use ($builder) {
                    $resourceIds = array();

                    foreach ($builder->getData()->getJob()->getAssignments() as $assignment) {
                        $resourceIds[] = $assignment->getResource()->getId();
                    }

                    return $repository->createQueryBuilder('s')
                        ->where('s.resource IN (:resources)')
                        ->setParameter('resources', $resourceIds)
                        ->addOrderBy('s.forename', 'ASC')
                        ->addOrderBy('s.surname', 'ASC');
                }
            )
        );

        $builder->add('notes', 'textarea');

        $builder->add('save', 'submit');
    }

    /**
     * {@inheritDoc}
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            array(
                'data_class' => 'BusinessMan\Bundle\JobBundle\Entity\Timesheet',
            )
        );
    }

    /**
     * {@inheritDoc}
     */
    public function getName()
    {
        return 'timesheet';
    }
}
